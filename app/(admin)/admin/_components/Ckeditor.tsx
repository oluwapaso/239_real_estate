"use client"

import { CkEditorProps } from '@/components/types'
import React, { useRef } from 'react'
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from "ckeditor5-custom-build";

const Ck_Editor_Component = ({ data, onDataChange, height = "620px", setEditor }: CkEditorProps) => {

    const editorRef = useRef<any>();
    const config = {
        toolbar: [
            'findAndReplace', 'selectAll', '|',
            'heading', '|',
            'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|',
            'bulletedList', 'numberedList', 'todoList', '|',
            'outdent', 'indent',
            'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
            'alignment', '|',
            'link', 'insertImage', 'blockQuote', 'insertTable', 'mediaEmbed', '|',
            'specialCharacters', 'horizontalLine', 'sourceEditing', '|',
            'undo', 'redo',
        ],
        heading: {
            options: [
                { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
                { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
                { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
                { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
            ]
        },
        link: {
            decorators: {
                addTargetToExternalLinks: false,
                defaultProtocol: 'https://',
                toggleDownloadable: {
                    mode: 'manual',
                    label: 'Downloadable',
                    attributes: {
                        download: 'file'
                    }
                },
                openInNewTab: {
                    mode: 'manual',
                    label: 'Open in a new tab',
                    defaultValue: true,			// This option will be selected by default.
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }
                }
            }
        },
        placeholder: '',
        // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-family-feature
        fontFamily: {
            options: [
                'default',
                'Arial, Helvetica, sans-serif',
                'Courier New, Courier, monospace',
                'Georgia, serif',
                'Lucida Sans Unicode, Lucida Grande, sans-serif',
                'Tahoma, Geneva, sans-serif',
                'Times New Roman, Times, serif',
                'Trebuchet MS, Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif'
            ],
            supportAllValues: true
        },
        // https://ckeditor.com/docs/ckeditor5/latest/features/font.html#configuring-the-font-size-feature
        fontSize: {
            options: [10, 12, 14, 'default', 18, 20, 22, 24, 26, 28, 30, 32, 35, 40],
            supportAllValues: true
        },
        // Be careful with the setting below. It instructs CKEditor to accept ALL HTML markup.
        // https://ckeditor.com/docs/ckeditor5/latest/features/general-html-support.html#enabling-all-html-features
        htmlSupport: {
            allow: [
                {
                    name: /.*/,
                    attributes: true,
                    classes: true,
                    styles: true
                }
            ]
        },
        shouldNotGroupWhenFull: true
    }

    if (!data || data == null) {
        data = "";
    }

    const handleHeight = () => {
        const cke_editor = document.querySelector(".ck-editor__editable") as HTMLElement;
        if (editorRef.current && cke_editor) {
            cke_editor.style.minHeight = `${height}`;
            cke_editor.style.maxHeight = `${height}`;
        }
    }

    return (
        <CKEditor editor={Editor as any} config={config as any} data={data} onFocus={handleHeight}
            onBlur={(event, editor: any) => {
                const cke_editor = editor.ui.view.editable.element;
                if (cke_editor) {
                    setTimeout(() => { handleHeight(); });
                }
            }}

            onChange={(event, editor: any) => {
                const newData = editor.getData();
                onDataChange(newData);
            }} onReady={(editor) => {
                editorRef.current = editor;
                if (setEditor) {
                    setEditor(editorRef);
                }
                handleHeight();
            }}
        />
    )

}

export default Ck_Editor_Component