
import { promises as fs } from 'fs';
import * as path from 'path';
// import * as cheerio from 'cheerio';
import nunjucks from 'nunjucks';

let njkenv;

/* */
// import * as path from 'path';
import * as url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/* */

const templates_dir = path.join(__dirname, '..', 'templates');


/**
 * Load the named template as a string
 * @param fn 
 * @returns 
 */
export async function get_template(fn: string): Promise<string> {
    const fname = path.join(templates_dir, fn);
    console.log(`get_template ${fn} ${fname}`);
    return await fs.readFile(fname, 'utf-8');
}

export async function render_template(fn: string, data): Promise<string> {
    if (!njkenv) {
        njkenv = new nunjucks.Environment(
            new nunjucks.FileSystemLoader([ templates_dir ], { watch: false }),
            { autoescape: false}
        );
    }
    return await njkenv.render(fn, data);
}

/**
 * Load the named template using Cheerio to generate a DOM structure
 * supporting jQuery-like API.  The DOM is configured for XML mode.
 * Hence, when calling `$.toHtml()` your application will be given
 * an XML string instead.
 * 
 * @param fn 
 * @returns 
 */
/* export async function get_template_dom(fn: string): Promise<cheerio.CheerioAPI> {
    let txt = await get_template(fn);

    return cheerio.load(txt, {
        xmlMode: true,
        decodeEntities: true, // Decode HTML entities.
        withStartIndices: false, // Add a `startIndex` property to nodes.
        withEndIndices: false, // Add an `endIndex` property to nodes.
    }, false);
} */
