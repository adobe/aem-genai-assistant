/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {useEditor, EditorContent, ReactNodeViewRenderer} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {useCallback, useEffect} from 'react';
import {View} from '@adobe/react-spectrum';
import Highlight from './Highlight.js';

function convertToHTML(content) {
  return content.replace(/\n/g, '<br />');
}

const EditorComponent = ({content, onContentUpdate, editable}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
    ],
    editorProps: {
      attributes: {
        class: 'editor-component',
      },
    },
    content: convertToHTML(content)
  })

  const updateHandler = useCallback((editor) => {
    if (editor.isEditable) {
      onContentUpdate(editor.getText());
    }
  }, [editor, onContentUpdate]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    if (content !== editor.getText()) {
      editor.commands.setContent(convertToHTML(content));
    }
    if (editable !== editor.isEditable) {
      editor.setEditable(editable);
    }
    editor.on('update', updateHandler);
    return () => {
      editor.off('update', updateHandler);
    }
  }, [editor, content, editable])

  const className = ['editor-component-container', editable ? 'editable' : ''].join(' ');

  return (
    <View UNSAFE_className={className}>
      <EditorContent editor={editor} />
    </View>
  )
}

export default EditorComponent;
