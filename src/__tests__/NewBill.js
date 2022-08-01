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

})
