/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";




describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
    })

    test('It should display New Bill page', async () => {
        await waitFor(() => screen.getByText("Envoyer une note de frais"))
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })
    test("It should highlighted mail icon in vertical layout", async () => {
        await waitFor(() => screen.getByTestId('icon-mail'))
        const mailIcon = screen.getByTestId('icon-mail')
        expect(mailIcon.classList.contains('active-icon')).toBeTruthy()
    })
  })

  describe('When I change input file', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
    })

    beforeEach(() => {
        document.body.innerHTML = NewBillUI()
    })

    test('It should call handleChangeFile', () => {
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }
        const newBill = new NewBill({
            document, onNavigate, store: null, localStorage: window.localStorage
        })
        const inputFile = screen.getByTestId('file')
        const eventChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const file = new File(['foo'], 'test.png', { type: 'image/png' })

        inputFile.addEventListener('change', eventChangeFile)
        Object.defineProperty(inputFile, 'files', { value: [file] })
        fireEvent.change(inputFile)

        expect(eventChangeFile).toHaveBeenCalled()
        expect(eventChangeFile.mock.results[0].value).toBeTruthy()
    })

    test('It should call handleChangeFile and return false if file type is not allow ', () => {
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }
        const newBill = new NewBill({
            document, onNavigate, store: null, localStorage: window.localStorage
        })
        
        const inputFile = screen.getByTestId('file')
        const eventChangeFile = jest.fn((e) => newBill.handleChangeFile(e))
        const file = new File(['foo'], 'test.pdf', { type: 'application/pdf' })

        inputFile.addEventListener('change', eventChangeFile)
        Object.defineProperty(inputFile, 'files', { value: [file] })
        fireEvent.change(inputFile)

        expect(eventChangeFile).toHaveBeenCalled()
        expect(eventChangeFile.mock.results[0].value).toBeFalsy()
    })

    
  })

  describe('When I submit form', () => {
    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.NewBill)
    })

    test('It should call handleSubmit ', () => {
        document.body.innerHTML = NewBillUI()

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
            document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const submitButton = screen.getByTestId('form-new-bill')

        const eventSubmit = jest.fn((e) => newBill.handleSubmit(e))
        submitButton.addEventListener('submit', eventSubmit)
        fireEvent.submit(submitButton)
        expect(eventSubmit).toHaveBeenCalled()
    })
  })


  describe("When i make a POST request on API", () => {
    beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee',
            email: 'employee@test.tld'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
    })
    test("It should fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
            return {
                create : () => { return Promise.reject(new Error("Erreur 500")) }
            }
        })

        const logSpy = jest.spyOn(console, 'error');

        document.body.innerHTML = NewBillUI()

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
            document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const expense = screen.getByTestId('expense-name');
        const datepicker = screen.getByTestId('datepicker');
        const amount = screen.getByTestId('amount');
        const vat = screen.getByTestId('vat');
        const pct = screen.getByTestId('pct');
        const inputFile = screen.getByTestId('file')

        const submitButton = screen.getByTestId('form-new-bill')
        const file = new File(['foo'], 'test.png', { type: 'image/png' })
        Object.defineProperty(inputFile, 'files', { value: [file] })

        expense.value = 'Test jest';
        datepicker.value = '2022-08-03'
        amount.value = 25;
        vat.value = '25';
        pct.value = 25;

        fireEvent.submit(submitButton)

        await new Promise(process.nextTick);
        expect(logSpy).toHaveBeenCalledWith("Erreur 500")
    })
    test('It should success and navigate to Bills page', async () => {
        mockStore.bills.mockImplementationOnce(() => {
            return {
                create : () => { return Promise.resolve() }
            }
        })
        document.body.innerHTML = NewBillUI()

        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }

        const newBill = new NewBill({
            document, onNavigate, store: mockStore, localStorage: window.localStorage
        })

        const expense = screen.getByTestId('expense-name');
        const datepicker = screen.getByTestId('datepicker');
        const amount = screen.getByTestId('amount');
        const vat = screen.getByTestId('vat');
        const pct = screen.getByTestId('pct');
        const inputFile = screen.getByTestId('file')

        const submitButton = screen.getByTestId('form-new-bill')
        const file = new File(['foo'], 'test.png', { type: 'image/png' })
        Object.defineProperty(inputFile, 'files', { value: [file] })

        expense.value = 'Test jest';
        datepicker.value = '2022-08-03'
        amount.value = 25;
        vat.value = '25';
        pct.value = 25;

        fireEvent.submit(submitButton)

        await new Promise(process.nextTick);
        await waitFor(() => screen.getByText("Mes notes de frais"))
        expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })
})

})
