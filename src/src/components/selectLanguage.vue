<template>
    <div class="physton-prompt-select-language" v-if="isOpen" @click="close">
        <div class="language-main" @click.stop>
            <div class="language-close" @click="close">
                <icon-close width="24" height="24" />
            </div>
            <div class="language-list" @click.stop>
                <div v-for="item in languages" :key="item.code"
                     :class="['language-item', item.code == languageCode ? 'selected' : '']" ref="items"
                     @click="onLanguageClick(item)">
                    {{ item.code }} - {{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import LanguageMixin from "@/mixins/languageMixin";
import IconClose from "@/components/icons/iconClose.vue";

export default {
    name: 'SelectLanguage',
    components: {IconClose},
    mixins: [LanguageMixin],
    props: {},
    data() {
        return {
            isOpen: false,
        }
    },
    computed: {},
    mounted() {
    },
    methods: {
        open() {
            this.isOpen = true
            this.$nextTick(() => {
                this.scrollToSelectedItem()
            })
        },
        close() {
            this.isOpen = false
        },
        onLanguageClick(item) {
            this.$emit('update:languageCode', item.code)
            this.close()
        },
        scrollToSelectedItem() {
            const items = this.$refs.items
            for (let i = 0; i < items.length; i++) {
                if (items[i].classList.contains('selected')) {
                    items[i].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    })
                    break
                }
            }
        }
    },
}
</script>
<style lang="less">
.physton-prompt-select-language {
  position: fixed;
  z-index: 2000;
  margin-top: 5px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);

  .language-main {
    height: 70%;
    position: relative;

    .language-close {
      display: block;
      padding: 4px;
      position: absolute;
      right: -14px;
      top: -14px;
      background: #ffffffe6;
      border-radius: 50%;
      box-shadow: 0px 1px 5px 0px #d81e06;
      cursor: pointer;
      z-index: 1;

      &:hover {
        background: #d81e06;
      }
    }

    .language-list {
      height: 100%;
      overflow: hidden;
      overflow-y: scroll;
      display: block;
      position: relative;
      box-shadow: 0 0 3px #4a54ff;
      border-radius: 6px 6px 4px 4px;
      background-color: #1e1e1ee6;
      transition: height .1s ease-in-out, width .1s ease-in-out;
      position: relative;

      .language-item {
        font-size: 14px;
        color: #fff;
        font-size: 14px;
        padding: 10px;
        cursor: pointer;

        &:hover, &.selected {
          background: center center #4A54FF;
          background-image: linear-gradient(315deg, #6772FF 0, #00F9E5 100%);
          background-size: 104% 104%;
        }
      }
    }
  }
}
</style>