import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Image, AlignLeft, Eye } from 'lucide-react';

interface ImageContent {
    id: string;
    file?: File;
    url: string;
    alt: string;
}

interface RichContent {
    type: 'text' | 'image';
    content?: string;
    imageData?: ImageContent;
    url?: string; // Added to match parsed description
}

interface ProductDescriptionProps {
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    collectDescriptionFiles: (files: File[]) => void;
    initialDescription?: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ setDescription, collectDescriptionFiles, initialDescription }) => {
    const [richContent, setRichContent] = useState<RichContent[]>([]);
    const [currentText, setCurrentText] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialDescription && richContent.length === 0) {
            try {
                const parsedContent: RichContent[] = JSON.parse(initialDescription);
                setRichContent(parsedContent.map(item => {
                    if (item.type === 'image') {
                        return {
                            type: 'image',
                            imageData: { id: Date.now().toString(), url: item.url || '', alt: '' },
                            url: item.url
                        };
                    }
                    return item;
                }));
            } catch (error) {
                console.error('Error parsing initial description:', error);
            }
        }
    }, [initialDescription]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const tempUrl = URL.createObjectURL(file);
            const imageContent: RichContent = {
                type: 'image',
                imageData: { id: Date.now().toString(), file, url: tempUrl, alt: file.name },
                url: tempUrl // Initialize with temp URL
            };
            const updatedContent = [...richContent, imageContent];
            setRichContent(updatedContent);
            updateDescription(updatedContent);
            collectDescriptionFiles(updatedContent
                .filter(item => item.type === 'image' && item.imageData?.file)
                .map(item => item.imageData!.file!));
        }
    };

    const addTextContent = () => {
        if (currentText.trim()) {
            const textContent: RichContent = { type: 'text', content: currentText };
            const updatedContent = [...richContent, textContent];
            setRichContent(updatedContent);
            setCurrentText('');
            updateDescription(updatedContent);
        }
    };

    const removeContent = (index: number) => {
        const updatedContent = richContent.filter((_, i) => i !== index);
        setRichContent(updatedContent);
        updateDescription(updatedContent);
        collectDescriptionFiles(updatedContent
            .filter(item => item.type === 'image' && item.imageData?.file)
            .map(item => item.imageData!.file!));
    };

    const moveContent = (index: number, direction: 'up' | 'down') => {
        const newContent = [...richContent];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newContent.length) {
            [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
            setRichContent(newContent);
            updateDescription(newContent);
            collectDescriptionFiles(newContent
                .filter(item => item.type === 'image' && item.imageData?.file)
                .map(item => item.imageData!.file!));
        }
    };

    const startEditing = (index: number, content: string) => {
        setEditingIndex(index);
        setEditingText(content);
    };

    const saveEditing = (index: number) => {
        if (editingText.trim()) {
            const updatedContent = [...richContent];
            updatedContent[index] = { type: 'text', content: editingText };
            setRichContent(updatedContent);
            updateDescription(updatedContent);
        }
        setEditingIndex(null);
        setEditingText('');
    };

    const updateDescription = (content: RichContent[]) => {
        const descriptionData = content.map(item => {
            if (item.type === 'text') return { type: 'text', content: item.content };
            return { type: 'image', url: item.imageData?.url || item.url };
        });
        setDescription(JSON.stringify(descriptionData));
    };

    const getContentLength = () => {
        return richContent.reduce((total, item) => total + (item.type === 'text' ? item.content?.length || 0 : 50), 0);
    };

    const renderPreview = () => {
        return richContent.map((item, index) => (
            <div key={index} className="mb-4">
                {item.type === 'text' ? (
                    <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">{item.content}</p>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <img
                            src={item.imageData?.url || item.url}
                            alt={item.imageData?.alt}
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            style={{ maxHeight: '300px' }}
                        />
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 20 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Mô tả sản phẩm</h2>
                    <p className="text-sm text-gray-500">Thêm text và hình ảnh để mô tả sản phẩm</p>
                </div>
                <span className="ml-auto text-red-500 text-sm font-medium">Bắt buộc</span>
            </div>

            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                    <Image size={16} />
                    Thêm ảnh
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                        showPreview ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <Eye size={16} />
                    {showPreview ? 'Chỉnh sửa' : 'Xem trước'}
                </button>
                <div className="ml-auto">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                        getContentLength() > 2500 ? 'bg-red-100 text-red-600' :
                            getContentLength() > 2000 ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-500'
                    }`}>
                        {getContentLength()}/3000
                    </span>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
            />

            {showPreview ? (
                <div className="border border-gray-200 rounded-xl p-4 min-h-[200px] bg-gray-50">
                    <h3 className="text-lg font-medium mb-4 text-gray-800">Xem trước mô tả sản phẩm</h3>
                    {richContent.length === 0 ? (
                        <p className="text-gray-500 italics">Chưa có nội dung nào được thêm</p>
                    ) : (
                        renderPreview()
                    )}
                </div>
            ) : (
                <>
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlignLeft size={16} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Thêm đoạn văn bản</span>
                        </div>
                        <div className="flex gap-2">
                            <textarea
                                value={currentText}
                                onChange={(e) => setCurrentText(e.target.value)}
                                rows={Math.max(5, Math.min(25, Math.ceil(currentText.length / 50) + 4))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                                placeholder="Nhập nội dung văn bản..."
                            />
                            <button
                                onClick={addTextContent}
                                disabled={!currentText.trim()}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Thêm
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl p-4 min-h-[200px]">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Nội dung mô tả ({richContent.length} phần tử)</h3>
                        {richContent.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8">
                                Chưa có nội dung nào. Hãy thêm văn bản hoặc hình ảnh ở trên.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {richContent.map((item, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                {item.type === 'text' ? (
                                                    editingIndex === index ? (
                                                        <div className="flex flex-col gap-2">
                                                            <textarea
                                                                value={editingText}
                                                                onChange={(e) => setEditingText(e.target.value)}
                                                                rows={Math.max(5, Math.ceil(editingText.length / 50))}
                                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <button
                                                                onClick={() => saveEditing(index)}
                                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                            >
                                                                Lưu
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <AlignLeft size={14} className="text-blue-500" />
                                                                <span className="text-xs font-medium text-blue-600">Văn bản</span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 line-clamp-3 whitespace-pre-wrap">{item.content}</p>
                                                            <div className="flex justify-between items-center mt-2">
                                                                <button
                                                                    onClick={() => startEditing(index, item.content || '')}
                                                                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Chỉnh sửa
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Image size={14} className="text-green-500" />
                                                            <span className="text-xs font-medium text-green-600">Hình ảnh</span>
                                                        </div>
                                                        <img
                                                            src={item.imageData?.url || item.url}
                                                            alt={item.imageData?.alt}
                                                            className="w-20 h-20 object-cover rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => moveContent(index, 'up')}
                                                    disabled={index === 0}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                                                    title="Di chuyển lên"
                                                >
                                                    <ChevronDown size={18} className="rotate-180" />
                                                </button>
                                                <button
                                                    onClick={() => moveContent(index, 'down')}
                                                    disabled={index === richContent.length - 1}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                                                    title="Di chuyển xuống"
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                                <button
                                                    onClick={() => removeContent(index)}
                                                    className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors shadow-sm"
                                                    title="Xóa"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ProductDescription;