/**
 * Indica si el formulario es válido o no
 * @param {NodeListOf<HTMLInputElement>} formInputs 
 * @returns {boolean} true si todos los inputs del formulario son válidos, false si al menos uno es inválido
 */
const isFormAutofilled = formInputs => {
	return new Promise(resolve => {
		setTimeout(() => {
			let result;
			for (let i = 0; i < formInputs.length; i++) {
				result = formInputs[i].matches(':-webkit-autofill');
				if (!result) break;
			};
			resolve(result);
		}, 10);
	});
};

/**
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @returns {HTMLElement} Devuelve el formulario activo actualmente
 */
const activeForm = formViews => {
	const forms = Array.from(formViews.children);
	let activeForm;
	forms.forEach(e => {
		if (e.classList.contains('front')) activeForm = e;
	});

	return activeForm;
};

/**
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @returns {number} Devuelve el index de la pestaña del formulario activo actualmente
 */
const activeFormTab = formNavbar => {
	const formTabs = Array.from(formNavbar.children);
	let activeFormTab;
	formTabs.forEach((e, index) => {
		if (e.classList.contains('active')) activeFormTab = index;
	});

	return activeFormTab;
};

/**
 * @param {boolean} valid true si el formulario es válido, false si el formulario es inválido
 * @param {boolean} autofilled true si el formulario fue autorrellenado, false si el formulario no fue autorrellenado
 * @returns {CustomEvent} Devuelve el evento "form"
 */
const formEvent = (valid, autofilled) => {
	return new CustomEvent('form', { detail: { valid, autofilled } })
}

/**
 * Activa el siguiente formulario
 * @param {number} index El indice del formulario
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const activateNextForm = (index, formViews, formNavbar, nextBtn) => {
	const forms = Array.from(formViews.children);
	const formTabs = Array.from(formNavbar.children);

	formTabs.forEach((tab, indexTab) => {
		if (indexTab > index) {
			if (forms[indexTab].classList.contains('valid') && forms[indexTab - 1].classList.contains('valid')) {
				formTabs[indexTab].classList.add('filled');
			};
		};
	});

	formTabs.forEach((tab, indexTab) => {
		if (indexTab === index) {
			if (!forms[indexTab + 1].classList.contains('valid') && forms[indexTab].classList.contains('valid')) {
				formTabs[indexTab + 1].classList.add('next');
			};
		};

		if (indexTab > index) {
			if (!forms[indexTab].classList.contains('valid') && forms[indexTab - 1].classList.contains('valid')) {
				formTabs[indexTab].classList.add('next')
			};
		};
	});
	nextBtn.classList.add('next');
};

/**
 * Activa el siguiente formulario
 * @param {number} index El indice del formulario
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const deactivateNextForm = (index, formNavbar, nextBtn) => {
	const formTabs = Array.from(formNavbar.children);

	formTabs.forEach((tab, indexTab) => {
		if (indexTab > index) {
			formTabs[indexTab].classList.remove('next');
			formTabs[indexTab].classList.remove('filled');
		};
	});
	nextBtn.classList.remove('next');
};

/**
 * Pasa al siguiente formulario
 * @param {number} index El indice del formulario
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const nextForm = (index, formViews, formNavbar, nextBtn) => {
	const forms = Array.from(formViews.children);
	const formTabs = Array.from(formNavbar.children);
	const frontForm = activeForm(formViews);
	const activeTab = activeFormTab(formNavbar);
	frontForm.classList.remove('front');
	frontForm.classList.add('hidden');
	frontForm.classList.add('left');
	frontForm.classList.remove('ready');
	formTabs[activeTab].classList.remove('active');
	formTabs[activeTab].classList.add('filled');
	formTabs[index].classList.add('active');
	formTabs[index].classList.remove('filled');
	formTabs[index].classList.remove('next');
	setTimeout(() => {
		forms[index].classList.add('ready');
	}, 500);
	setTimeout(async () => {
		forms[index].classList.remove('hidden');
		forms[index].classList.add('show');
		forms[index].classList.add('front');
		if (index - activeTab > 1) {
			const skipedForms = (index - activeTab) - 1;
			for (let i = 1; i <= skipedForms; i++) {
				forms[activeTab + i].classList.add('left');
				forms[activeTab + i].classList.add('show');
				forms[activeTab + i].classList.remove('ready');
			};
		};
		index + 1 === forms.length && nextBtn.innerText !== 'Enviar' ? nextBtn.innerText = 'Enviar' : nextBtn.innerText = 'Siguiente';

		const formIsAutofilled = await isFormAutofilled(forms[index].querySelectorAll('input'));

		formIsAutofilled || forms[index].classList.contains('valid') && nextBtn.innerText === 'Siguiente' ? nextBtn.classList.add('next') : nextBtn.classList.remove('next');

		if (nextBtn.innerText === 'Siguiente' && nextBtn.classList.contains('submit')) nextBtn.classList.remove('submit');
		if (nextBtn.innerText === 'Enviar' && !nextBtn.classList.contains('submit') && forms[index].classList.contains('valid')) nextBtn.classList.add('submit');
	}, 280);
};

/**
 * Regresa al anterior formulario
 * @param {number} index El indice del formulario
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const previousForm = (index, formViews, formNavbar, nextBtn) => {
	const forms = Array.from(formViews.children);
	const formTabs = Array.from(formNavbar.children);
	const frontForm = activeForm(formViews);
	const activeTab = activeFormTab(formNavbar);

	//Ocultando el formulario actual
	frontForm.classList.remove('front');
	frontForm.classList.add('hidden');
	frontForm.classList.remove('show');
	frontForm.classList.remove('ready');

	// Desactivando pestaña actual
	formTabs[activeTab].classList.remove('active');
	frontForm.classList.contains('valid') ? formTabs[activeTab].classList.add('filled') : formTabs[activeTab].classList.add('next');

	// Activando pestaña clickeada
	formTabs[index].classList.add('active');
	formTabs[index].classList.remove('filled');

	setTimeout(() => {
		forms[index].classList.add('ready');
	}, 500);
	setTimeout(() => {
		forms[index].classList.remove('hidden');
		forms[index].classList.remove('left');
		if (!forms[index].classList.contains('show') && !forms[index].classList.contains('form1')) forms[index].classList.add('show');
		forms[index].classList.add('front');

		if (activeTab - index > 1) {
			const skipedForms = (activeTab - index) - 1;
			for (let i = 1; i <= skipedForms; i++) {
				forms[activeTab - i].classList.remove('left');
				forms[activeTab - i].classList.remove('show');
				forms[activeTab - i].classList.remove('ready');
			};
		};
		index + 1 === forms.length && nextBtn.innerText !== 'Enviar' ? nextBtn.innerText = 'Enviar' : nextBtn.innerText = 'Siguiente';
		(isFormAutofilled(forms[index].querySelectorAll('input')) || forms[index].classList.contains('valid')) && nextBtn.innerText === 'Siguiente' ? nextBtn.classList.add('next') : nextBtn.classList.remove('next');
		if (nextBtn.innerText === 'Siguiente' && nextBtn.classList.contains('submit')) nextBtn.classList.remove('submit');
	}, 280);
};

/**
 * Añade un Event Listener de "click" a las pestañas de navegación del formulario
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const formNavbarClickListener = (formNavbar, formViews, nextBtn) => {
	const formTabs = Array.from(formNavbar.children);

	formTabs.forEach((e, index) => {
		e.addEventListener('click', () => {
			if (activeForm(formViews) && activeForm(formViews).classList.contains('ready') && index > activeFormTab(formNavbar) && (e.classList.contains('next') || e.classList.contains('filled'))) {
				nextForm(index, formViews, formNavbar, nextBtn);
			};

			if (activeForm(formViews) && activeForm(formViews).classList.contains('ready') && index < activeFormTab(formNavbar)) {
				previousForm(index, formViews, formNavbar, nextBtn);
			};
		});
	});
};

/**
 * Añade un Event Listener del evento "form" a todos los formularios
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 */
const formUpdateEventListener = (formViews, formNavbar, nextBtn) => {
	const forms = Array.from(formViews.children);

	forms.forEach((form, index) => {
		form.addEventListener('form', event => {
			if (index + 1 < forms.length) event.detail.valid ? activateNextForm(index, formViews, formNavbar, nextBtn) : deactivateNextForm(index, formNavbar, nextBtn);

			if (index + 1 === forms.length) event.detail.valid ? nextBtn.classList.add('submit') : nextBtn.classList.remove('submit');
		});

		if (index > 0) {
			const formInputs = form.querySelectorAll('input');
			let validForm = false;
			let validAutofilled = false;

			formInputs.forEach(input => {
				input.addEventListener('keyup', async () => {
					if (input.checkValidity() && input.classList.contains('invalid')) input.classList.remove('invalid');

					for (let i = 0; i < formInputs.length; i++) {
						validForm = formInputs[i].checkValidity();
						if (!validForm) break;
					}

					validAutofilled = await isFormAutofilled(formInputs);

					if (validForm) {
						if (activeForm(formViews) === form) {
							activeForm(formViews).classList.add('valid');
							activeForm(formViews).dispatchEvent(formEvent(true, false));
						};
					};
					
					if (!validForm) {
						if (activeForm(formViews) === form) {
							activeForm(formViews).classList.remove('valid');
							activeForm(formViews).dispatchEvent(formEvent(false, false));
						};
					};

					if (validAutofilled) {
						if (input.checkValidity() && input.classList.contains('invalid')) input.classList.remove('invalid');
						if (activeForm(formViews) === form) activateNextForm(index, formViews, formNavbar, nextBtn);
						form.classList.add('valid');
					};
				});
			});
		};
	});
};

/**
 * Añade un Event Listener de "click" al botón siguiente/enviar
 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
 * @param {HTMLElement} registerForm Acepta el elemento tag "form" del formulario 
 */
const nextBtnClickListener = (nextBtn, formViews, formNavbar, registerForm) => {
	const forms = Array.from(formViews.children);

	nextBtn.addEventListener('click', () => {
		if (nextBtn.innerText === 'Enviar' && nextBtn.classList.contains('submit') && registerForm.checkValidity()) {
			registerForm.submit();
		};

		if (nextBtn.innerText === 'Siguiente' && activeForm(formViews) && activeForm(formViews).classList.contains('ready') && nextBtn.classList.contains('next')) {
			nextForm(activeFormTab(formNavbar) + 1, formViews, formNavbar, nextBtn);
		} else {
			if (activeForm(formViews) && !activeForm(formViews).classList.contains('valid')) {
				if (activeForm(formViews) === forms[0]) {
					activeForm(formViews).children[0].classList.add('invalid');
				} else {
					if (Array.from(activeForm(formViews).querySelectorAll('input')).find(input => input.value.length === 0 || !input.checkValidity()).value.length === 0) {
						Array.from(activeForm(formViews).querySelectorAll('input')).find(input => input.value.length === 0 || !input.checkValidity()).focus();
					} else {
						Array.from(activeForm(formViews).querySelectorAll('input')).find(input => input.value.length === 0 || !input.checkValidity()).classList.add('invalid');
						Array.from(activeForm(formViews).querySelectorAll('input')).find(input => input.value.length === 0 || !input.checkValidity()).focus();
					}
				};
			};
		};
	});
}

/**
 * The constructor function of the "MultiForm" class takes as arguments multiple HTML elements of a multiple form.
 * @class
 * @classdec Class Register, can activate, get and trigger elements of the registration form
 * @example <caption>Example of .activate() method</caption>
 * // Activate the instantiated register form
 * .activate();
 * @example <caption>Example of .currentActiveForm() method</caption>
 * // returns the currently active form, HTMLElement type
 * .currentActiveForm();
 * @example <caption>Example of .triggerFormEvent() method</caption>
 * // Trigger "form" event on Register forms
 * .triggerFormEvent(currentActiveForm, valid, autofilled);
 * @author Keving Andrades
 */
class MultiForm {
	#formViews
	#formNavbar
	#nextBtn
	#registerForm
	/**
	 * @param {HTMLElement} formViews Acepta el elemento padre de multiples formularios separados por divs
	 * @param {HTMLElement} formNavbar Acepta el elemento padre de multiples pestañas de navegación de formularios separados por spans
	 * @param {HTMLElement} nextBtn Acepta el botón de siguiente/enviar de un formulario
	 * @param {HTMLElement} registerForm Acepta el elemento tag "form" del formulario 
	 */
	constructor(formViews, formNavbar, nextBtn, registerForm) {
		this.#formViews = formViews instanceof HTMLElement ? formViews : console.error('ERROR: El argumento formViews debe ser un elemento HTML');
		this.#formNavbar = formNavbar instanceof HTMLElement ? formNavbar : console.error('ERROR: El argumento formNavbar debe ser un elemento HTML');
		this.#nextBtn = nextBtn instanceof HTMLElement ? nextBtn : console.error('ERROR: El argumento nextBtn debe ser un elemento HTML');
		this.#registerForm = registerForm instanceof HTMLElement ? registerForm : console.error('ERROR: El argumento registerForm debe ser un elemento HTML');
	};

	/**
	 * Activate the instantiated register form
	 */
	activate() {
        formNavbarClickListener(this.#formNavbar, this.#formViews, this.#nextBtn);
        formUpdateEventListener(this.#formViews, this.#formNavbar, this.#nextBtn);
        nextBtnClickListener(this.#nextBtn, this.#formViews, this.#formNavbar, this.#registerForm);
	};

	/**
	 * @returns {HTMLElement} Returns the current active form
	 */
	currentActiveForm() {
		return activeForm(this.#formViews);
	};

	/**
	 * Trigger "form" event on Register forms
	 * @param {HTMLElement} currentActiveForm 
 	 * @param {boolean} valid true if form was autofill, false if form wasn't autofill
 	 * @param {boolean} autofilled true if form was autofill, false if form wasn't autofill
	 */
	triggerFormEvent(currentActiveForm, valid, autofilled) {
		currentActiveForm.dispatchEvent(formEvent(valid, autofilled));
	};
}

export {
	MultiForm
};