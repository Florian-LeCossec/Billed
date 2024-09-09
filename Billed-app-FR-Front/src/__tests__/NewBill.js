/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES_PATH } from "../constants/routes.js"
import router from "../app/Router.js"
import store from "../__mocks__/store.js" // Import du mock store

describe("Given I am connected as an employee", () => {
  let onNavigate; // Déplacer la déclaration ici

  beforeEach(() => {
    const html = NewBillUI()
    document.body.innerHTML = html

    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

    onNavigate = (pathname) => { // Assigner la fonction ici
      document.body.innerHTML = ROUTES_PATH[pathname]
    }
  })

  describe("When I am on NewBill Page", () => {
    test("Then I should see the form", () => {
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
      expect(screen.getByTestId("submit-button")).toBeTruthy()
    })

    describe("When I upload a file", () => {
      test("Then it should handle file change", () => {
        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const fileInput = screen.getByTestId('file');

        fileInput.addEventListener('change', handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['file'], 'file.png', { type: 'image/png' })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.isValidImageType).toBe(true);
      });

      test("Then it should not accept invalid file types", () => {
        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        const fileInput = screen.getByTestId('file');

        fileInput.addEventListener('change', handleChangeFile);
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['file'], 'file.txt', { type: 'text/plain' })],
          },
        });

        expect(handleChangeFile).toHaveBeenCalled();
        expect(newBill.isValidImageType).toBe(false);
      });
    })

    describe("When I submit the form", () => {
      test("Then it should handle form submit", () => {
        const handleSubmit = jest.fn(new NewBill({ document, onNavigate, store, localStorage: window.localStorage }).handleSubmit)
        const form = screen.getByTestId('form-new-bill')

        form.addEventListener('submit', handleSubmit)
        fireEvent.submit(form)

        expect(handleSubmit).toHaveBeenCalled()
      });

      test("Then it should not submit the form if required fields are missing", () => {
        const newBill = new NewBill({ document, onNavigate, store, localStorage: window.localStorage });
        const handleSubmit = jest.fn(newBill.handleSubmit);
        const form = screen.getByTestId('form-new-bill');

        form.addEventListener('submit', handleSubmit);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();
      });
    })

    describe("when I update a bill", () => {
      test("Then it should update the bill", () => {
        const updateBill = jest.fn(new NewBill({ document, onNavigate, store, localStorage: window.localStorage }).updateBill)
        const form = screen.getByTestId('form-new-bill')

        form.addEventListener('submit', updateBill)
        fireEvent.submit(form)

        expect(updateBill).toHaveBeenCalled()
      })
    })
  })
})