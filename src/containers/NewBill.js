import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null

    new Logout({ document, localStorage, onNavigate })
  }
  handleChangeFile = e => {
    e.preventDefault()

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]

    if (!allowedTypes.includes(file.type)){
        console.log('Erreur de format de fichier')
        return
    }

    this.file = file;
  }
  handleSubmit = e => {
    e.preventDefault()
    
    const bill = {
        email: JSON.parse(localStorage.getItem("user")).email,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        status: 'pending',
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
    }

    const formData = new FormData()
    formData.append('file', this.file)

    for(let key in bill) {
        formData.append(key, bill[key])
    }

    this.store
    .bills()
    .create({
      data: formData,
      headers: {
        noContentType: true
      }
    })
    .then(() => {
      this.onNavigate(ROUTES_PATH['Bills'])
    }).catch(error => console.error(error))
  }
}