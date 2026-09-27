import React, { useState } from 'react'
import { CheckIcon, CopyIcon } from '../ui/Icons'

/**
 * Lightweight, dependency-free enterprise Markdown renderer for ServiceDesk Pro.
 * Handles headings (with anchor IDs), lists, code blocks, blockquotes, links,
 * and inline styling without bloated external dependencies.
 */

export function extractHeadings(markdownText) {
  if (!markdownText) return []
  const lines = markdownText.split('\n')
  const headings = []

  lines.forEach((line) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
      headings.push({ level, text, id })
    }
  })

  return headings
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 overflow-hidden text-xs font-mono shadow-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400">
        <span className="uppercase font-semibold tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderInlineText(text) {
  if (!text) return ''

  // Split by inline code first: `code`
  const codeParts = text.split(/(`[^`]+`)/g)

  return codeParts.map((part, pIdx) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={pIdx}
          className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[12px] bg-slate-100 dark:bg-slate-800 text-primary-700 dark:text-primary-300 border border-slate-200 dark:border-slate-700"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    // Replace bold **text** and links [text](url)
    // We can parse links and bold with regex matching
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const boldRegex = /\*\*([^*]+)\*\*/g

    // Simple multi-pass tokenizer
    let segments = [{ text: part, type: 'text' }]

    // Bold pass
    segments = segments.flatMap((seg) => {
      if (seg.type !== 'text') return seg
      const pieces = seg.text.split(/(\*\*[^*]+\*\*)/g)
      return pieces.map((p) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length >= 4) {
          return { text: p.slice(2, -2), type: 'bold' }
        }
        return { text: p, type: 'text' }
      })
    })

    // Link pass
    segments = segments.flatMap((seg) => {
      if (seg.type !== 'text') return seg
      const pieces = seg.text.split(/(\[[^\]]+\]\([^)]+\))/g)
      return pieces.map((p) => {
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
        if (m) {
          return { text: m[1], url: m[2], type: 'link' }
        }
        return { text: p, type: 'text' }
      })
    })

    return segments.map((seg, sIdx) => {
      if (seg.type === 'bold') {
        return (
          <strong key={`${pIdx}-${sIdx}`} className="font-semibold text-slate-900 dark:text-slate-100">
            {seg.text}
          </strong>
        )
      }
      if (seg.type === 'link') {
        return (
          <a
            key={`${pIdx}-${sIdx}`}
            href={seg.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 dark:text-primary-400 underline hover:text-primary-700 dark:hover:text-primary-300 font-medium"
          >
            {seg.text}
          </a>
        )
      }
      return <span key={`${pIdx}-${sIdx}`}>{seg.text}</span>
    })
  })
}

export function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null

  // Split into raw blocks (code blocks or text chunks)
  const blocks = []
  const lines = content.split('\n')
  let inCodeBlock = false
  let codeBuffer = []
  let codeLang = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        blocks.push({
          type: 'code',
          code: codeBuffer.join('\n'),
          language: codeLang,
        })
        codeBuffer = []
        codeLang = ''
        inCodeBlock = false
      } else {
        // Start code block
        inCodeBlock = true
        codeLang = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Normal markdown parsing
    const trimmed = line.trim()
    if (!trimmed) {
      blocks.push({ type: 'empty' })
      continue
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() })
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
      continue
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() })
      continue
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' })
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push({ type: 'blockquote', text: line.slice(2).trim() })
      continue
    }

    // Ordered list: 1. or 2.
    const numMatch = line.match(/^(\d+)\.\s+(.+)$/)
    if (numMatch) {
      blocks.push({ type: 'ol', number: numMatch[1], text: numMatch[2].trim() })
      continue
    }

    // Unordered list: - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ type: 'ul', text: line.slice(2).trim() })
      continue
    }

    // Paragraph text
    blocks.push({ type: 'p', text: line })
  }

  return (
    <div className={`space-y-3.5 text-slate-800 dark:text-slate-200 leading-relaxed text-sm ${className}`}>
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'h1': {
            const id = block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h2
                key={idx}
                id={id}
                className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 pt-5 pb-1 border-b border-slate-200 dark:border-slate-800 scroll-mt-20"
              >
                {renderInlineText(block.text)}
              </h2>
            )
          }
          case 'h2': {
            const id = block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h3
                key={idx}
                id={id}
                className="text-lg font-semibold text-slate-900 dark:text-slate-100 pt-4 pb-0.5 scroll-mt-20"
              >
                {renderInlineText(block.text)}
              </h3>
            )
          }
          case 'h3': {
            const id = block.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
            return (
              <h4
                key={idx}
                id={id}
                className="text-base font-semibold text-slate-900 dark:text-slate-100 pt-3 scroll-mt-20"
              >
                {renderInlineText(block.text)}
              </h4>
            )
          }
          case 'code':
            return <CodeBlock key={idx} code={block.code} language={block.language} />
          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="my-3 pl-4 py-2 border-l-4 border-primary-500 bg-slate-50 dark:bg-slate-850/60 rounded-r-lg text-slate-700 dark:text-slate-300 italic text-sm"
              >
                {renderInlineText(block.text)}
              </blockquote>
            )
          case 'ul':
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-2 my-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 mt-2 shrink-0" />
                <div className="flex-1">{renderInlineText(block.text)}</div>
              </div>
            )
          case 'ol':
            return (
              <div key={idx} className="flex items-start gap-2.5 ml-1 my-1">
                <span className="font-mono font-bold text-xs text-primary-600 dark:text-primary-400 shrink-0 w-5 text-right">
                  {block.number}.
                </span>
                <div className="flex-1">{renderInlineText(block.text)}</div>
              </div>
            )
          case 'hr':
            return <hr key={idx} className="my-6 border-slate-200 dark:border-slate-800" />
          case 'empty':
            return <div key={idx} className="h-1" />
          case 'p':
          default:
            return (
              <p key={idx} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {renderInlineText(block.text)}
              </p>
            )
        }
      })}
    </div>
  )
}

export default MarkdownRenderer
