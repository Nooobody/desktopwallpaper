<template>
  <div class="mt-3">
    <p>{{title}} <i class="fa fa-plus text-success" @click="startTag()" v-if="!adding"></i></p>
    <input type="text" v-if="adding" class="form-control mb-3" v-model="editedTag" @keyup.enter="addTag">
    <div class="bg-dark p-1" style="max-width:450px;">
      <div class="badge badge-pill badge-primary mr-1" v-for="(tag, index) in tags" @click.self="editTag(index)">
        {{tag}}
        <i class="fa fa-times text-danger" @click.stop="deleteTag(index)"></i>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: ["tags", "title"],
    data() {
      return {
        adding: false,
        editing: false,
        editedTag: "",
        tagIndex: undefined
      };
    },
    methods: {
      startTag() {
        this.adding = true;
        this.editedTag = "";
      },
      addTag() {
        this.adding = false;

        if (this.editedTag === "") {
          if (this.editing) {
            this.editing = false;
            this.deleteTag(this.tagIndex);
          }
          return;
        }

        if (!this.editing) {
          this.$emit("add-tag", this.editedTag);
        }
        else {
          this.$emit("edit-tag", this.editedTag, this.tagIndex);
          this.editing = false;
        }
      },
      deleteTag(index) {
        if (this.adding) {
          return;
        }

        this.$emit("delete-tag", index);
      },
      editTag(index) {
        if (this.adding) {
          return;
        }
        this.adding = true;
        this.editing = true;
        this.editedTag = this.tags[index];
        this.tagIndex = index;
      }
    }
  }
</script>
