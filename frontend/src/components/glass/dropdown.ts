import type { InjectionKey } from 'vue'
export const dropdownKey: InjectionKey<(command?: string) => void> = Symbol('glass-dropdown')
