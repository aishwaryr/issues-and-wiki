import { type RefObject, useEffect } from "react";

/** Type: the part of a useActionState form state this hook reads. */
type FormErrorState = { errors?: object; message?: string };

/**
 * After a failed submit, moves focus to the first invalid field (in DOM order), or to
 * the form-level message (`data-form-message`, `tabIndex={-1}`) when no field is invalid.
 * Without it, focus stays on the submit button, which was disabled while pending, so
 * keyboard and screen-reader users would have to hunt for what went wrong.
 */
export function useFocusFirstError(
  formRef: RefObject<HTMLFormElement | null>,
  state: FormErrorState,
) {
  useEffect(() => {
    if (!state.errors && !state.message) {
      return;
    }
    const form = formRef.current;
    const target =
      form?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      form?.querySelector<HTMLElement>("[data-form-message]");
    target?.focus();
  }, [formRef, state]);
}
