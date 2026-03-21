import {useState} from "react";

interface Payload {
  firstName: string,
  lastName: string,
  email: string,
  city: string,
  street: string,
  postalCode: string,
}

export default function Checkout() {
  const [formData, setFormData] = useState<Payload>({
  firstName: '',
  lastName: '',
  email: '',
  city: '',
  street: '',
  postalCode: '',
})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {  // ← добавил =>
    setFormData(prevState => ({
      ...prevState,
      [e.target.name]: e.target.value
    }))
  }

  return (

    <form>
      <input name={'firstName'} value={formData.firstName} onChange={handleChange}/>
      <input name={'lastName'} value={formData.lastName} onChange={handleChange}/>
      <input name={'email'} value={formData.email} onChange={handleChange}/>
      <input name={'city'} value={formData.city} onChange={handleChange}/>
      <input name={'street'} value={formData.street} onChange={handleChange}/>
      <input name={'postalCode'} value={formData.postalCode} onChange={handleChange}/>
    </form>
  )


}