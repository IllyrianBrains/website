// Lets the tests import the site's .ts helpers directly: Node 22 strips the
// types itself, but the helpers import each other without a file extension
// ("./members"), the way Astro/Vite allow and Node doesn't. This adds ".ts".
import { register } from 'node:module';

register('data:text/javascript,' + encodeURIComponent(`
  export async function resolve(specifier, context, next) {
    try {
      return await next(specifier, context);
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND' || !/^\\.\\.?\\//.test(specifier) || /\\.[a-z]+$/.test(specifier)) throw error;
      return next(specifier + '.ts', context);
    }
  }
`));
