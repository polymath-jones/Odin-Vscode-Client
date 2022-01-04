
export class TemplateParser {

    private document: Document;
    private parser: DOMParser
    tags = ["<a ", "<a>", "</a>", "<abbr>", "<abbr ", "</abbr>", "<acronym>", "<acronym ", "</acronym>", "<address>", "<address ", "</address>", "<applet>", "<applet ", "</applet>", "<area>", "<area ", "</area>", "<article>", "</article>", "<article ", "<aside>", "<aside ", "</aside>", "<audio>", "<audio ", "</audio>", "<b>", "</b>", "<base>", "<base ", "</base>", "<basefont>", "<basefont ", "</basefont>", "<bdi>", "</bdi>", "<bdi ", "<bdo>", "</bdo>", "<bdo ", "<big>", "<big ", "</big>", "<blockquote>", "<blockquote ", "</blockquote>", "<body>", "<body ", "</body>", "<br ", "<br />", "<br>", "<br/>", "</br>", "<button>", "<button ", "</button>", "<canvas>", "</canvas>", "<canvas ", "<caption>", "<caption ", "</caption>", "<center>", "<center ", "</center>", "<cite>", "<cite ", "</cite>", "<code>", "<code ", "</code>", "<col>", "<col ", "</col>", "<colgroup>", "<colgroup ", "</colgroup>", "<datalist>", "<datalist ", "</datalist>", "<dd>", "</dd>", "<dd ", "<del>", "<del ", "</del>", "<details>", "<details ", "</details>", "<dfn>", "</dfn>", "<dfn ", "<dialog>", "<dialog ", "</dialog>", "<dir>", "</dir>", "<dir ", "<div>", "<div ", "</div>", "<dl>", "</dl>", "<dl ", "<dt>", "</dt>", "<dt ", "<em>", "<em ", "</em>", "<embed>", "</embed>", "<embed ", "<fieldset>", "<fieldset ", "</fieldset>", "<figcaption>", "</figcaption>", "<figcaption ", "<figure>", "<figure ", "</figure>", "<font ", "</font>", "<font>", "<footer>", "</footer>", "<footer ", "<form>", "</form>", "<form ", "<frame>", "</frame>", "<frame ", "<frameset>", "<frameset ", "</frameset>", "<h1>", "</h1>", "<h1 ", "<h2>", "</h2>", "<h2 ", "<h3>", "</h3>", "<h3 ", "<h4>", "</h4>", "<h4 ", "<h5>", "</h5>", "<h5 ", "<h6>", "</h6>", "<h6 ", "<head>", "</head>", "<head ", "<header>", "<header ", "</header>", "<hr>", "<hr ", "</hr>", "<html>", "</html>", "<html ", "<i>", "</i>", "<iframe>", "<iframe ", "</iframe>", "<img>", "</img>", "<img ", "<input>", "</input>", "<input ", "<ins>", "<ins ", "</ins>", "</kbd>", "<kbd>", "<kbd ", "<label>", "<label ", "</label>", "<legend>", "<legend ", "</legend>", "<li ", "<li>", "</li>", "<link>", "<link ", "</link>", "<main>", "<main ", "</main>", "<map>", "</map>", "<map ", "<mark>", "</mark>", "<mark ", "<meta>", "</meta>", "<meta ", "<meter>", "</meter>", "<meter ", "<nav>", "</nav>", "<nav ", "<noframes>", "</noframes>", "<noframes ", "<noscript>", "<noscript ", "</noscript>", "<object>", "<object ", "</object>", "<ol>", "</ol>", "<ol ", "<optgroup>", "</optgroup>", "<optgroup ", "<option>", "</option>", "<option ", "<output>", "<output ", "</output>", "<p>", "</p>", "<p ", "<param>", "<param ", "</param>", "<pre>", "</pre>", "<pre ", "<progress>", "<progress ", "</progress>", "<q>", "</q>", "<q ", "<rp>", "</rp>", "<rp ", "<rt>", "<rt ", "</rt>", "<ruby>", "</ruby>", "<ruby ", "<s>", "</s>", "<s ", "<samp>", "</samp>", "<samp ", "<section>", "</section>", "<section ", "<select>", "</select>", "<select ", "<small>", "<small ", "</small>", "<source>", "</source>", "<source ", "<span>", "<span ", "</span>", "<strike>", "</strike>", "<strike ", "<strong>", "<strong ", "</strong>", "<style>", "</style>", "<style ", "<sub>", "<sub ", "</sub>", "<summary>", "</summary>", "<summary ", "<sup>", "<sup ", "</sup>", "<table ", "<table>", "</table>", "<tbody>", "</tbody>", "<tbody ", "<td>", "<td ", "</td>", "<textarea>", "<textarea ", "</textarea>", "<tfoot>", "</tfoot>", "<tfoot ", "<th>", "</th>", "<th ", "<thead>", "</thead>", "<thead ", "<time>", "<time ", "</time>", "<title>", "</title>", "<title ", "<tr>", "<tr ", "</tr>", "<track>", "</track>", "<track ", "<tt>", "</tt>", "<tt ", "<u>", "</u>", "<ul ", "<ul>", "</ul>", "<var>", "<var ", "</var>", "<video>", "</video>", "<video ", "<wbr>", "<wbr ", "</wbr>"];

    constructor(src: string) {

        this.parser = new DOMParser();
        this.document = this.parser.parseFromString(src, "text/html")   
    }

    parseSource(src: string) {
        this.document = this.parser.parseFromString(src, "text/html");
    }

    print(): string {

        this.document.querySelectorAll("[dropzone],[draggable],[odin-locked]").forEach(elt=>{
            elt.removeAttribute("dropzone")
            elt.removeAttribute("draggable")
            elt.removeAttribute("odin-locked")
        })

        let root = this.document.body.innerHTML
        let matches = root.match(/(?<=(<[\s]*)|(<\/[\s]*))(\w)*/gm)

        if (matches) {
            for (let match of matches) {
                if (!this.tags.includes(`<${match}>`) && match !== "") {
                    const reg = new RegExp(`(?<=(<[\s]*)|(<\/[\s]*))${match}`)
                    root = root.replace(reg, this.capitalizeFirstLetter(match))
                }
            }
        }
        return root
    }
    capitalizeFirstLetter(word: string): string {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    getDocument(): Document {
        return this.document
    }
}