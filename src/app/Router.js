import store from "./store.js"
import Login, { PREVIOUS_LOCATION } from "../containers/Login.js"
import Bills  from "../containers/Bills.js"
import NewBill from "../containers/NewBill.js"
import Dashboard from "../containers/Dashboard.js"

import BillsUI from "../views/BillsUI.js"
import DashboardUI from "../views/DashboardUI.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js"


const toggleActiveIcon = (icon) => {
    const divIcon1 = document.getElementById('layout-icon1')
    const divIcon2 = document.getElementById('layout-icon2')
    divIcon1.classList.remove('active-icon')
    divIcon2.classList.remove('active-icon')
    document.getElementById(icon).classList.add('active-icon')
}

export default () => {
  const rootDiv = document.getElementById('root')
  rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })

  window.onNavigate = (pathname) => {

    window.history.pushState(
      {},
      pathname,
      window.location.origin + pathname
    )

    switch (pathname) {
        case ROUTES_PATH['Login']:
            rootDiv.innerHTML = ROUTES({ pathname })
            document.body.style.backgroundColor="#0E5AE5"
            new Login({ document, localStorage, onNavigate, PREVIOUS_LOCATION, store })
            break;

        case ROUTES_PATH['Bills']:
            rootDiv.innerHTML = ROUTES({ pathname, loading: true })
            toggleActiveIcon('layout-icon1');
            const bills = new Bills({ document, onNavigate, store, localStorage  })
            bills.getBills().then(data => {
              rootDiv.innerHTML = BillsUI({ data })
              toggleActiveIcon('layout-icon1');
              new Bills({ document, onNavigate, store, localStorage })
            }).catch(error => {
              rootDiv.innerHTML = ROUTES({ pathname, error })
            })
            break;

        case ROUTES_PATH['NewBill']:
            rootDiv.innerHTML = ROUTES({ pathname, loading: true })
            new NewBill({ document, onNavigate, store, localStorage })
            toggleActiveIcon('layout-icon2');
            break;

        case ROUTES_PATH['Dashboard']:
            rootDiv.innerHTML = ROUTES({ pathname, loading: true })
            const dashboard = new Dashboard({ document, onNavigate, store, bills: [], localStorage })
            dashboard.getBillsAllUsers().then(bills => {
                rootDiv.innerHTML = DashboardUI({data: {bills}})
                new Dashboard({document, onNavigate, store, bills, localStorage})
              }).catch(error => {
              rootDiv.innerHTML = ROUTES({ pathname, error })
            })
            break;

    
        default:
            break;
    }
  }

  window.onpopstate = (e) => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (window.location.pathname === "/" && !user) {
      document.body.style.backgroundColor="#0E5AE5"
      rootDiv.innerHTML = ROUTES({ pathname: window.location.pathname })
    }
    else if (user) {
      onNavigate(PREVIOUS_LOCATION)
    }
  }

  if (window.location.pathname === "/" && window.location.hash === "") {
    onNavigate(window.location.pathname)
  } else if (window.location.hash !== "") {
    onNavigate(window.location.hash)
  }

  return null
}

