/**
 * 為未提供型別定義的相依套件提供最低限度的型別遮蔽。
 * Type shims for dependencies that ship no type definitions.
 */

declare module 'toastr' {
  const toastr: any
  export default toastr
}

declare module 'vue3-colorpicker' {
  const component: any
  export default component
  export const ColorPicker: any
}

declare module 'vue-clipboard3' {
  const useClipboard: () => {
    copy: (text: string) => Promise<void>
    inClipboard: (text: string) => Promise<boolean>
  }
  export default useClipboard
}

declare module 'autosize-input' {
  const autosizeInput: (el: HTMLElement, options?: Record<string, unknown>) => void
  export default autosizeInput
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
