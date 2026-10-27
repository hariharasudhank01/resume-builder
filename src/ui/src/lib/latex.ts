import type { Entry, Resume, TemplateKey } from '../types'

const escape = (s: string) =>
  s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/→/g, '$\\rightarrow$')
    .replace(/–/g, '--')
    .replace(/—/g, '---')
    .replace(/’/g, "'")

const PREAMBLE: Record<TemplateKey, string> = {
  classic: `\\documentclass[10.5pt,a4paper]{article}
\\usepackage[margin=1.6cm]{geometry}
\\usepackage{charter}`,
  compact: `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=1.2cm]{geometry}
\\usepackage{lmodern}`,
  modern: `\\documentclass[10.5pt,a4paper]{article}
\\usepackage[margin=1.5cm]{geometry}
\\usepackage[sfdefault]{inter}`,
}

function entries(list: Entry[]) {
  return list
    .map(
      (e) => `\\entry{${escape(e.heading)}}{${escape(e.dates)}}{${escape(e.subheading)}}{${escape(e.location ?? '')}}
\\begin{itemize}
${e.bullets.map((b) => `  \\item ${escape(b.text)}`).join('\n')}
\\end{itemize}`,
    )
    .join('\n\n')
}

export function toLatex(r: Resume, template: TemplateKey): string {
  return `${PREAMBLE[template]}
\\usepackage[T1]{fontenc}
\\usepackage{enumitem,titlesec,hyperref}
\\setlist[itemize]{leftmargin=1.2em,itemsep=1pt,topsep=2pt}
\\titleformat{\\section}{\\large\\bfseries}{}{0pt}{}[\\titlerule]
\\pagestyle{empty}
\\newcommand{\\entry}[4]{\\textbf{#1}\\hfill #2\\\\\\textit{#3}\\hfill #4}

\\begin{document}
\\begin{center}
  {\\LARGE\\bfseries ${escape(r.name)}}\\\\[2pt]
  ${r.contact.map(escape).join(' \\textbullet{} ')}
\\end{center}

\\section*{Professional Summary}
${escape(r.summary.text)}

\\section*{Technical Skills}
${r.skills.map((s) => `\\textbf{${escape(s.label)}:} ${escape(s.items)}`).join('\\\\\n')}

\\section*{Work Experience}
${entries(r.experience)}
${r.projects.length ? `\n\\section*{Projects}\n${entries(r.projects)}\n` : ''}
\\section*{Education}
${r.education.map((e) => `\\entry{${escape(e.institution)}}{${escape(e.dates)}}{${escape(e.degree)}}{${escape(e.location)}}`).join('\\\\[4pt]\n')}

\\section*{Certifications}
${r.certifications.map(escape).join(' \\textbullet{} ')}
\\end{document}
`
}
