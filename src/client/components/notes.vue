<template>
  <div class="notes-wrapper" @mousemove="drag($event)">
    <div class="add-note" @click="addNote">
      <i class="fa fa-plus"></i>
    </div>
    <div class="note" v-for="(note, index) in notes" @mouseover="resizeStart" @mousemove="resizeMouseMove" @mouseout="resizeEnd" @mouseup="resizeEnd" :style="note.style"  v-resize="noteResize(note)">
      <div class="note-header" @mousedown.left="dragStart($event, note, index)" @mouseup.left="dragEnd($event, note)">
        <div class="delete-note" @click="deleteNote(index)">
          <i class="fa fa-times"></i>
        </div>
      </div>
      <div class="note-body">
        <textarea v-model="note.text" @input="saveText($event, note)"></textarea>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .notes-wrapper {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
  }

  .add-note {
    z-index: 100;
    position: fixed;
    top: 40px;
    left: 10px;
    font-size: 20px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.5);
    text-shadow: 3px 3px 3px rgba(0, 0, 0, 0.5);
    pointer-events: initial;
  }

  .note {
    z-index: 120;
    overflow: hidden;
    resize: both;
    position: absolute;
    pointer-events: initial;
    background: linear-gradient(#FEFFCF, #FCFAA7);
  }
  .note-header {
    height: 20px;
    width: 100%;
    cursor: pointer;
    background-color: #F8F7BA;
  }
  .delete-note {
    position: absolute;
    right: 5px;
    color: #8e8e8e;
    font-size: 14px;
  }
  .note-body {
    height: calc(100% - 20px);
    padding: 5px;
  }
  .note-body textarea {
    width: 100%;
    height: 100%;
    resize: none;
    background-color: transparent;
    border: 0;
    outline: none;
  }
</style>

<script>
  import { debounce } from 'debounce';
  import { resize } from './resizeDirective';
  export default {
    props: ['notes'],
    data() {
      return {
        dragging: false
      }
    },
    directives: { resize },
    methods: {
      addNote() {
        let notes = this.notes || [];
        notes.push({
          style: {
            left: '400px',
            top: '400px',
            width: '100px',
            height: '100px'
          }
        });
        this.notes = notes;
        this.saveNotes();
      },
      resizeStart(e) {
        this.checkW = e.target.clientWidth;
        this.checkH = e.target.clientHeight;
      },
      resizeCheck(e) {
        if (e.target.clientWidth !== this.checkW || e.target.clientHeight !== this.checkH) {
          this.checkX = e.x;
          this.checkY = e.y;
          this.resizing = true;
        }
      },
      resizeMove(e) {
        if (this.resizing) {
          let newW = this.checkW + e.x - this.checkX;
          let newH = this.checkH + e.y - this.checkY;
          if (newW < this.checkW) {
            e.target.style.width = newW + 'px';
          }
          if (newH < this.checkH) {
            e.target.style.height = newH + 'px';
          }
        }
      },
      resizeEnd(e) {
        this.resizing = false;
      },
      resizeMouseMove(e) {
        if (this.resizing) {
          this.resizeMove(e);
        }
        else {
          this.resizeCheck(e);
        }
      },
      dragStart(e, note, index) {
        this.dragging = index;
        this.dragPos = {
          x: e.x - note.style.left.split("px")[0],
          y: e.y - note.style.top.split("px")[0]
        }
      },
      drag(e) {
        if (this.dragging !== false) {
          let note = this.notes[this.dragging];
          note.style.top = (e.y - this.dragPos.y) + 'px';
          note.style.left = (e.x - this.dragPos.x) + 'px';
          this.notes[this.dragging] = note;
        }
      },
      dragEnd(e, note) {
        if (this.dragging !== false) {
          note.style.top = (e.y - this.dragPos.y) + 'px';
          note.style.left = (e.x - this.dragPos.x) + 'px';
          this.dragging = false;
          this.saveNotes();
        }
      },
      deleteNote(index) {
        this.notes = this.notes.filter((n, i) => index !== i);
        this.saveNotes();
      },
      noteResize(note) {
        return (rect) => {
          note.style.width = rect.width + 'px';
          note.style.height = rect.height + 'px';
          this.saveNotes();
        }
      },
      saveText: debounce(function(e, note) {
        note.text = e.target.value;
        this.saveNotes();
      }, 200),
      saveNotes() {
        this.$emit('save-notes', this.notes);
      }
    }
  }
</script>
