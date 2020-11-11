export class FormBuilder {
  private readonly form : HTMLFormElement

  constructor(action: string, method: string, target: string) {
    this.form = document.createElement("form");
    this.form.action = action;
    this.form.method = method;
    this.form.target = target;
  }

  withInput(name: string, value: string): FormBuilder {
    const input = document.createElement("input");
    input.name = name;
    input.value = value;
    this.form.appendChild(input);

    return this;
  }

  getForm(): HTMLFormElement {
    return this.form;
  }
}
