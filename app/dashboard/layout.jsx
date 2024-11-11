import React from 'react'
import Header from './_component/Header'

export default function Dashboardlayout({children}) {
  return (
    <div>
        <Header/>
        <div className="mx-9 md:mx-20 lg:mx-36">
        {children}
            </div>
        
        </div>
  )
}
