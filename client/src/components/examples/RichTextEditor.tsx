import { useState } from 'react'
import { RichTextEditor } from '../RichTextEditor'

export default function RichTextEditorExample() {
  const [content, setContent] = useState('<p>This is a <strong>rich text editor</strong> with support for:</p><ul><li>Bold and italic text</li><li>Links and images</li><li>Lists and quotes</li><li>Tables and code blocks</li></ul>')

  return (
    <div className="max-w-4xl space-y-4">
      <RichTextEditor
        content={content}
        onChange={setContent}
        placeholder="Write your finding description..."
      />
      <div className="text-sm text-muted-foreground">
        HTML Output: {content.substring(0, 100)}...
      </div>
    </div>
  )
}