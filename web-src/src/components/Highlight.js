import { Node, mergeAttributes } from '@tiptap/core';

const Highlight = Node.create({
  name: 'highlight',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  // addAttributes() {
  //   console.log('addAttributes');
  //   return {
  //     class: {
  //       default: 'variable',
  //     },
  //   };
  // },

  parseHTML() {
    console.log('parseHTML');
    return [
      {
        tag: 'span',
        getAttrs: (dom) => {
          console.log('getAttrs', dom.classList.contains('function') && dom.classList.contains('token'));
          return dom.classList.contains('function') && dom.classList.contains('token');
        },
      },
    ];
  },

  addNodeView() {
    return ({
              node, HTMLAttributes, getPos, editor,
            }) => {
      console.log('addNodeView', node, HTMLAttributes, getPos, editor);
      const listItem = document.createElement('li')
      const checkboxWrapper = document.createElement('label')
      const checkboxStyler = document.createElement('span')
      const checkbox = document.createElement('input')
      const content = document.createElement('div')

      checkboxWrapper.contentEditable = 'false'
      checkbox.type = 'checkbox'
      checkbox.addEventListener('change', event => {
        // if the editor isn’t editable and we don't have a handler for
        // readonly checks we have to undo the latest change
        if (!editor.isEditable && !this.options.onReadOnlyChecked) {
          checkbox.checked = !checkbox.checked

          return
        }

        const { checked } = event.target

        if (editor.isEditable && typeof getPos === 'function') {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .command(({ tr }) => {
              const position = getPos()
              const currentNode = tr.doc.nodeAt(position)

              tr.setNodeMarkup(position, undefined, {
                ...currentNode?.attrs,
                checked,
              })

              return true
            })
            .run()
        }
        if (!editor.isEditable && this.options.onReadOnlyChecked) {
          // Reset state if onReadOnlyChecked returns false
          if (!this.options.onReadOnlyChecked(node, checked)) {
            checkbox.checked = !checkbox.checked
          }
        }
      })

      Object.entries(this.options.HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      listItem.dataset.checked = node.attrs.checked
      if (node.attrs.checked) {
        checkbox.setAttribute('checked', 'checked')
      }

      checkboxWrapper.append(checkbox, checkboxStyler)
      listItem.append(checkboxWrapper, content)

      Object.entries(HTMLAttributes).forEach(([key, value]) => {
        listItem.setAttribute(key, value)
      })

      return {
        dom: listItem,
        contentDOM: content,
        update: updatedNode => {
          if (updatedNode.type !== this.type) {
            return false
          }

          listItem.dataset.checked = updatedNode.attrs.checked
          if (updatedNode.attrs.checked) {
            checkbox.setAttribute('checked', 'checked')
          } else {
            checkbox.removeAttribute('checked')
          }

          return true
        },
      }
    }
  },

  renderHTML({ HTMLAttributes }) {
    console.log('renderHTML', HTMLAttributes);
    return ['strong', HTMLAttributes, 0]
  },
});

export default Highlight;
