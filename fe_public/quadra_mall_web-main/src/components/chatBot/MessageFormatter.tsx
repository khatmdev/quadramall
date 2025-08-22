// components/Chat/MessageFormatter.tsx
import React from 'react';
import { 
  Hash,
  List,
  Table as TableIcon,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';

interface MessageFormatterProps {
  content: string;
}

interface ParsedSection {
  type: 'header' | 'table' | 'list' | 'text' | 'highlight' | 'separator';
  content: string[];
  level?: number;
  title?: string;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({ content }) => {
  
  const parseContent = (text: string): ParsedSection[] => {
    const sections: ParsedSection[] = [];
    const lines = text.split('\n').map(line => line.trim());
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line) {
        i++;
        continue;
      }
      
      // Detect headers
      if (isHeader(line)) {
        sections.push({
          type: 'header',
          content: [cleanHeaderText(line)],
          level: getHeaderLevel(line),
          title: cleanHeaderText(line)
        });
        i++;
      }
      // Detect tables
      else if (isTableStart(lines, i)) {
        const tableResult = parseTable(lines, i);
        sections.push({
          type: 'table',
          content: tableResult.content,
          title: 'Bảng thông tin'
        });
        i = tableResult.nextIndex;
      }
      // Detect lists
      else if (isListItem(line)) {
        const listResult = parseList(lines, i);
        sections.push({
          type: 'list',
          content: listResult.content,
          title: 'Danh sách'
        });
        i = listResult.nextIndex;
      }
      // Detect highlight/important text
      else if (isHighlight(line)) {
        sections.push({
          type: 'highlight',
          content: [line],
          title: 'Thông tin quan trọng'
        });
        i++;
      }
      // Detect separator
      else if (isSeparator(line)) {
        sections.push({
          type: 'separator',
          content: [line]
        });
        i++;
      }
      // Regular text - group consecutive text lines
      else {
        const textResult = parseTextBlock(lines, i);
        sections.push({
          type: 'text',
          content: textResult.content
        });
        i = textResult.nextIndex;
      }
    }
    
    return sections;
  };

  // Helper functions for detection
  const isHeader = (line: string): boolean => {
    return (
      line.startsWith('#') ||
      (line.startsWith('**') && line.endsWith('**') && line.length > 6) ||
      (/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ\s]{3,}$/.test(line) && line.length < 100) ||
      !!line.match(/^[IVX]+\.\s/) || // Roman numerals
      !!line.match(/^\d+\.\s[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/) !== null // Numbered headers
    );
  };

  const getHeaderLevel = (line: string): number => {
    if (line.startsWith('###')) return 3;
    if (line.startsWith('##')) return 2;
    if (line.startsWith('#')) return 1;
    if (line.match(/^[IVX]+\./)) return 1;
    if (line.match(/^\d+\./)) return 2;
    return 1;
  };

  const cleanHeaderText = (line: string): string => {
    return line
      .replace(/^#+\s*/, '')
      .replace(/^\*\*/, '')
      .replace(/\*\*$/, '')
      .replace(/^[IVX]+\.\s*/, '')
      .replace(/^\d+\.\s*/, '')
      .trim();
  };

  const isTableStart = (lines: string[], index: number): boolean => {
    const line = lines[index];
    const nextLine = lines[index + 1];
    return line.includes('|') && nextLine?.includes('---');
  };

  const parseTable = (lines: string[], startIndex: number) => {
    const content: string[] = [];
    let i = startIndex;
    
    // Add header
    content.push(lines[i]);
    i++;
    
    // Skip separator line
    if (lines[i]?.includes('---')) {
      i++;
    }
    
    // Add data rows
    while (i < lines.length && lines[i]?.includes('|')) {
      content.push(lines[i]);
      i++;
    }
    
    return { content, nextIndex: i };
  };

  const isListItem = (line: string): boolean => {
    return (
      line.match(/^[\*\-\•]\s/) ||
      line.match(/^\d+[\.\)]\s/) ||
      line.match(/^[a-zA-Z][\.\)]\s/) ||
      line.startsWith('- ') ||
      line.startsWith('* ') ||
      line.startsWith('• ') ||
      line.startsWith('✓ ') ||
      line.startsWith('✅ ') ||
      line.startsWith('- **') ||
      line.startsWith('* **')
    );
  };

  const parseList = (lines: string[], startIndex: number) => {
    const content: string[] = [];
    let i = startIndex;
    
    while (i < lines.length) {
      const line = lines[i];
      if (!line) {
        i++;
        continue;
      }
      
      if (isListItem(line)) {
        content.push(line);
        i++;
      } else {
        break;
      }
    }
    
    return { content, nextIndex: i };
  };

  const isHighlight = (line: string): boolean => {
    return (
      (line.startsWith('**') && line.endsWith('**')) ||
      line.includes('🎯') ||
      line.includes('💡') ||
      line.includes('⚠️') ||
      line.includes('✅') ||
      line.includes('❗') ||
      /^(LƯU Ý|CHÚ Ý|QUAN TRỌNG|KHUYẾN CÁO|GỢI Ý)/i.test(line)
    );
  };

  const isSeparator = (line: string): boolean => {
    return /^[\-=_]{3,}$/.test(line);
  };

  const parseTextBlock = (lines: string[], startIndex: number) => {
    const content: string[] = [];
    let i = startIndex;
    
    while (i < lines.length) {
      const line = lines[i];
      if (!line) {
        i++;
        continue;
      }
      
      if (isHeader(line) || isTableStart(lines, i) || isListItem(line) || isSeparator(line)) {
        break;
      }
      
      content.push(line);
      i++;
    }
    
    return { content, nextIndex: i };
  };

  // Render functions
  const renderHeader = (section: ParsedSection) => {
    const level = section.level || 1;
    const sizeClass = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
    const bgGradient = level === 1 
      ? 'from-emerald-100 to-green-100' 
      : level === 2 
      ? 'from-emerald-50 to-green-50'
      : 'from-gray-50 to-gray-100';
    
    return (
      <div className={`msg-header flex items-center gap-3 my-3 p-3 bg-gradient-to-r ${bgGradient} rounded-lg border border-emerald-200`}>
        <Hash className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <h3 className={`font-semibold text-emerald-800 ${sizeClass}`}>
          {section.content[0]}
        </h3>
      </div>
    );
  };

  const renderTable = (section: ParsedSection) => {
    const [headerLine, ...dataLines] = section.content;
    
    if (!headerLine) return null;
    
    const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
    const rows = dataLines.map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    ).filter(row => row.length > 0);
    
    return (
      <div className="msg-table-container overflow-x-auto my-4">
        <div className="flex items-center gap-2 mb-2">
          <TableIcon className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Bảng thông tin</span>
        </div>
        <table className="msg-table w-full border-collapse bg-white rounded-lg shadow-sm border border-emerald-200">
          <thead>
            <tr className="bg-gradient-to-r from-emerald-50 to-green-50">
              {headers.map((header, index) => (
                <th key={index} className="border border-emerald-200 px-3 py-2 text-left font-semibold text-emerald-800 text-sm">
                  {formatInlineText(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-emerald-50 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-emerald-200 px-3 py-2 text-sm text-gray-700">
                    {formatInlineText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderList = (section: ParsedSection) => {
    return (
      <div className="msg-list-container space-y-2 my-4">
        <div className="flex items-center gap-2 mb-2">
          <List className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-700">Danh sách</span>
        </div>
        {section.content.map((item, index) => {
          const cleanItem = item.replace(/^[\*\-\•\d+\.\)\sa-zA-Z\.\)]\s*/, '').trim();
          return (
            <div key={index} className="msg-list-item flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-l-4 border-emerald-400 hover:shadow-sm transition-shadow">
              <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 flex-1">
                {formatInlineText(cleanItem)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderHighlight = (section: ParsedSection) => {
    const getHighlightType = (content: string) => {
      if (content.includes('⚠️') || /^(LƯU Ý|CHÚ Ý|QUAN TRỌNG)/i.test(content)) {
        return { icon: AlertTriangle, color: 'yellow', bgColor: 'from-yellow-50 to-amber-50', borderColor: 'border-yellow-400', textColor: 'text-yellow-800' };
      }
      if (content.includes('✅') || content.includes('HOÀN THÀNH')) {
        return { icon: CheckCircle2, color: 'green', bgColor: 'from-green-50 to-emerald-50', borderColor: 'border-green-400', textColor: 'text-green-800' };
      }
      if (content.includes('💡') || /^(GỢI Ý|KHUYẾN CÁO)/i.test(content)) {
        return { icon: Lightbulb, color: 'blue', bgColor: 'from-blue-50 to-indigo-50', borderColor: 'border-blue-400', textColor: 'text-blue-800' };
      }
      return { icon: Info, color: 'blue', bgColor: 'from-blue-50 to-indigo-50', borderColor: 'border-blue-400', textColor: 'text-blue-800' };
    };

    return (
      <div className="msg-highlight-container my-3">
        {section.content.map((line, index) => {
          const highlightType = getHighlightType(line);
          const IconComponent = highlightType.icon;
          
          return (
            <div key={index} className={`msg-highlight p-3 bg-gradient-to-r ${highlightType.bgColor} rounded-lg border-l-4 ${highlightType.borderColor} shadow-sm`}>
              <div className="flex items-start gap-2">
                <IconComponent className={`w-4 h-4 ${highlightType.textColor} mt-0.5 flex-shrink-0`} />
                <span className={`font-medium ${highlightType.textColor} text-sm`}>
                  {formatInlineText(line.replace(/^\*\*|\*\*$/g, ''))}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderText = (section: ParsedSection) => {
    return (
      <div className="msg-text-container my-2 space-y-2">
        {section.content.map((line, index) => (
          <p key={index} className="msg-text text-gray-700 leading-relaxed text-sm">
            {formatInlineText(line)}
          </p>
        ))}
      </div>
    );
  };

  const renderSeparator = () => {
    return (
      <div className="msg-separator my-4 flex items-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent"></div>
      </div>
    );
  };

  // Format inline text (bold, italic, etc.)
  const formatInlineText = (text: string) => {
    let formatted = text;
    
    // Bold text **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-emerald-700">$1</strong>');
    
    // Italic text *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-emerald-600">$1</em>');
    
    // Code `text`
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const sections = parseContent(content);

  return (
    <div className="message-formatter space-y-1">
      {sections.map((section, index) => {
        switch (section.type) {
          case 'header':
            return <div key={index} className="message-fade-in">{renderHeader(section)}</div>;
          case 'table':
            return <div key={index} className="message-fade-in">{renderTable(section)}</div>;
          case 'list':
            return <div key={index} className="message-fade-in">{renderList(section)}</div>;
          case 'highlight':
            return <div key={index} className="message-fade-in">{renderHighlight(section)}</div>;
          case 'separator':
            return <div key={index} className="message-fade-in">{renderSeparator()}</div>;
          case 'text':
          default:
            return <div key={index} className="message-fade-in">{renderText(section)}</div>;
        }
      })}
    </div>
  );
};

export default MessageFormatter;