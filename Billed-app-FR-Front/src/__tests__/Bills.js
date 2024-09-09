/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.classList).toContain('active-icon');
    });
    test("Then bills should be ordered from latest to earliest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });

  describe("when I click on an eye icon", () => {
    test("then the bill modal should be opened", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const billsPage = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills });
      const eyeIcons = screen.getAllByTestId('icon-eye');
      const handleClick = jest.fn(billsPage.handleClickIconEye);
      const modale = document.getElementById('modaleFile');

      $.fn.modal = jest.fn(() => modale.classList.add('show'));

      eyeIcons.forEach(eyeIcon => {
        eyeIcon.addEventListener('click', handleClick(eyeIcon));
        userEvent.click(eyeIcon);
        expect(handleClick).toHaveBeenCalled();
        expect(modale).toHaveClass('show');
      });
    });
  });
});

// api tests get
describe("Given I am a user connected as employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(
        window,
        'localStorage',
        { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));

      const newBillButton = screen.getByText("Nouvelle note de frais");
      const billsTableRow = screen.getByTestId("tbody");

      expect(newBillButton).toBeTruthy();
      expect(billsTableRow).toBeTruthy();
      expect(within(billsTableRow).getAllByRole("row")).toHaveLength(bills.length);
    });

    test("fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementation(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          }
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    test("fetches bills from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementation(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          }
        };
      });
      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});