import common from './common'

/**
 * 宿主 webui 於頁面提供的全域 updateInput。
 * declare 不輸出任何程式碼，執行期查找的仍是頁面全域名稱；
 */
declare const updateInput: Function

/**
 * 將 prompt 寫入宿主輸入框並通知 webui 重算：
 * 寫入 value 後收起 tagcomplete 建議面板，宿主提供 updateInput 時優先呼叫，
 * 未提供時派發原生 input 事件交由宿主的 input 監聽接手。
 *
 * @param textarea 宿主的 prompt 輸入框
 * @param value 要寫入的文字
 */
export function setPromptTextareaValueAndDispatchEvent(textarea: HTMLTextAreaElement, value: string)
{
	textarea.value = value
	common.hideCompleteResults(textarea)
	if (typeof updateInput === 'function')
	{
		updateInput(textarea)
	} else
	{
		textarea.dispatchEvent(new Event('input'))
	}
}
