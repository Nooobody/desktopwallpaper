<template>
  <div class="card">
    <div class="card-header">Background Settings</div>
    <div class="card-body">
      <div class="btn btn-primary mb-2" @click="setBgFromClipboard">
        Set background from Clipboard
      </div>
      <p>Background maximum rating</p>
      <div class="btn-group">
        <div class="btn" :class="{ 'btn-primary': rating === 's', 'btn-secondary': rating !== 's'}" @click="setRating('s')">Safe</div>
        <div class="btn" :class="{ 'btn-primary': rating === 'q', 'btn-secondary': rating !== 'q'}" @click="setRating('q')">Questionable</div>
        <div class="btn" :class="{ 'btn-primary': rating === 'e', 'btn-secondary': rating !== 'e'}" @click="setRating('e')">Explicit</div>
      </div>
      <tag-list
        title="Tags"
        :tags="tags"
        @add-tag="addTag"
        @edit-tag="editTag"
        @delete-tag="deleteTag"
      ></tag-list>
      <tag-list
        title="Tags to Exclude"
        :tags="excludedTags"
        @add-tag="addTagExclude"
        @edit-tag="editTagExclude"
        @delete-tag="deleteTagExclude"
      ></tag-list>
    </div>
  </div>
</template>

<script>
  import { clipboard } from "electron";
  import * as TagList from './tags-list.vue';

  export default {
    components: {
      "tag-list": TagList
    },
    computed: {
      rating() {
        return this.$store.state.background.rating;
      },
      tags() {
        return this.$store.state.background.tags;
      },
      excludedTags() {
        return this.$store.state.background.excludedTags;
      }
    },
    methods: {
      setBgFromClipboard() {
        this.$store.dispatch("setBackground", {
          img: clipboard.readText("clipboard"),
          foundWith: "Clipboard",
          tags: []
        });
        this.$store.dispatch("toggleBackgroundTimer", true);
      },
      setRating(rating) {
        this.$store.dispatch("setRatings", rating);
      },
      addTag(tag) {
        this.$store.commit("addTag", tag);
      },
      editTag(tag, ind) {
        this.$store.commit("editTag", { tag, ind });
      },
      deleteTag(index) {
        this.$store.commit("deleteTag", index);
      },
      addTagExclude(tag) {
        this.$store.commit("addExcludedTag", tag);
      },
      editTagExclude(tag, ind) {
        this.$store.commit("editExcludedTag", { tag, ind });
      },
      deleteTagExclude(index) {
        this.$store.commit("deleteExcludedTag", index);
      }
    }
  }
</script>
