/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bill, { getBills } from "../containers/Bills"

import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
            type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
    })


    describe("When I am on Bills Page", () => {
        test("Then it should render new bill button", async () => {
            await waitFor(() => screen.getByText("Mes notes de frais"))
            expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
        })
        test("Then bill icon in vertical layout should be highlighted", async () => {
            await waitFor(() => screen.getByTestId('icon-window'))
            const windowIcon = screen.getByTestId('icon-window')

            //to-do write expect expression
            expect(windowIcon.classList[0]).toEqual('active-icon')

        })
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills })
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
            const antiChrono = (a, b) => ((a < b) ? 1 : -1)
            const datesSorted = [...dates].sort(antiChrono)
            expect(dates).toEqual(datesSorted)
        })
    })
   

    describe("When i click on IconEye", () => {
        test('Then it should call handleClickIconEye', () => {
            
            $.prototype.modal = () => {}

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname })
            }
        
            const bill = new Bill({
            document, onNavigate, store: null, localStorage: window.localStorage
            })
    
            document.body.innerHTML = BillsUI({ data: bills })

            const iconEye = screen.getAllByTestId('icon-eye')[0]
            const handleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon))
    
            iconEye.addEventListener('click', () => handleClickIconEye(iconEye));
            userEvent.click(iconEye)
            expect(handleClickIconEye).toHaveBeenCalled()
        })
    })

    describe("When an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(
                window,
                'localStorage',
                { value: localStorageMock }
            )
            window.localStorage.setItem('user', JSON.stringify({
                type: 'Employee'
            }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
        })
        test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                list : () =>  {
                    return Promise.reject(new Error("Erreur 404"))
                }
                }})
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })
        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                list : () =>  {
                    return Promise.reject(new Error("Erreur 500"))
                }
                }})
        
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick);
            const message = await screen.getByText(/Erreur 500/)
            expect(message).toBeTruthy()
        })
    })

})