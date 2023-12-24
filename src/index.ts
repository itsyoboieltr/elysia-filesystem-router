import Elysia from 'elysia';
import path from 'node:path';

async function generateTypeDefinitions(
  relativeDirs: string[],
  routeNames: string[],
  importNames: string[]
) {
  let output = '';

  // Generate the import statement for Elysia
  output += `import type Elysia from 'elysia';\n`;

  // Generate the import statements for the routes
  for (let i = 0; i < relativeDirs.length; i++) {
    output += `import { ${importNames[i]} } from './${relativeDirs[i]}';\n`;
  }

  // Generate the utility types
  output += `
declare global {
  type AddPrefixToRoutes<Routes, Prefix extends string> = {
    [K in keyof Routes as \`\${Prefix}\${K & string}\`]: Routes[K];
  };

  type RemapElysiaWithPrefix<
    ElysiaType,
    Prefix extends string
  > = ElysiaType extends Elysia<
    infer BasePath,
    infer Decorators,
    infer Definitions,
    infer ParentSchema,
    infer Macro,
    infer Routes,
    infer Scoped
  >
    ? Elysia<
        BasePath,
        Decorators,
        Definitions,
        ParentSchema,
        Macro,
        AddPrefixToRoutes<Routes, Prefix>,
        Scoped
      >
    : never;

`;

  // Generate the ElysiaFileSystemRouter type
  output += `  type ElysiaFileSystemRouter = `;
  for (let i = 0; i < importNames.length; i++) {
    if (i > 0) output += ' & ';
    output += `RemapElysiaWithPrefix<typeof ${importNames[i]}, '${routeNames[i]}'>`;
  }
  output += ';\n';
  output += '}\n';

  // Write the output to the declaration file
  await Bun.write(path.join(path.dirname(Bun.main), 'routes.d.ts'), output);
}

export interface FileSystemRouterConfig {
  rootDir: string;
}

export async function fileSystemRouter(
  config: FileSystemRouterConfig = { rootDir: '.' }
) {
  const instance = new Elysia({ name: 'filesystem-router', seed: config });
  const root = path.normalize(
    config.rootDir.replace(/^\.?\//, '').replace(/\/$/, '')
  );
  const rootDepth = root === '.' ? 0 : root.split(path.sep).length;
  const rootPath = path.join(path.dirname(Bun.main), root);
  const mainFile = path.join(rootPath, 'index.ts');

  const glob = new Bun.Glob('**/index.ts');
  const files = (
    await Array.fromAsync(glob.scan({ cwd: rootPath, absolute: true }))
  ).filter((file) => file !== mainFile);

  const relativeDirs = files.map((file) =>
    path.join(root, path.dirname(path.relative(rootPath, file)))
  );

  const routeNames = relativeDirs.map((relativeDir) => {
    return `${path.sep}${relativeDir
      .split(path.sep)
      .toSpliced(0, rootDepth)
      .join(path.sep)}`;
  });

  const importNames = relativeDirs.map((relativeDir) => {
    return relativeDir
      .split(path.sep)
      .toSpliced(0, rootDepth)
      .map((segment, index) =>
        index === 0
          ? segment
          : segment.charAt(0).toUpperCase() + segment.slice(1)
      )
      .join('')
      .concat('Route');
  });

  for (let index = 0; index < files.length; index++) {
    const imported = await import(files[index]);
    const route = imported[importNames[index]] as Elysia;
    if (!route)
      throw new Error(
        `The file '${files[index]}' does not export a route named '${importNames[index]}'`
      );
    route.routes.forEach((route) => {
      route.path = path.join(routeNames[index], route.path);
    });
    instance.use(route);
  }

  await generateTypeDefinitions(relativeDirs, routeNames, importNames);

  return instance as ElysiaFileSystemRouter;
}
