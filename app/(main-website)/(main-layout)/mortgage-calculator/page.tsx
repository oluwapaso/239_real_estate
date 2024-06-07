"use client"

import HeroHeader from '@/components/HeroHeader'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../GlobalRedux/store'

const MortgageCalculator = () => {

    const comp_info = useSelector((state: RootState) => state.app);

    const empty_form_data = {
        property_price: 150000,
        downpay_dollar: 30000,
        downpay_percent: 20,
        length_of_mortgage: 30,
        interest_rate: 3,
    }

    const [monthly_payment, setMonthlyPayment] = useState("0");
    const [show_calc, setShowCalc] = useState(false);
    const [calc_data, setCalcData] = useState(empty_form_data);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCalcData((prev_data) => {
            return {
                ...prev_data,
                [e.target.name]: e.target.value
            }
        })
    }

    const handleDpChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.name == "downpay_dollar") {

            let value = 100 * (parseFloat(e.target.value) / calc_data.property_price)
            if (Number.isNaN(value)) {
                value = 0
            }

            setCalcData((prev_data) => {
                return {
                    ...prev_data,
                    [e.target.name]: e.target.value,
                    ["downpay_percent"]: parseFloat(value.toFixed(2))
                }
            })

        } else if (e.target.name == "downpay_percent") {

            let value = calc_data.property_price * (parseFloat(e.target.value) / 100)

            setCalcData((prev_data) => {
                return {
                    ...prev_data,
                    [e.target.name]: e.target.value,
                    ["downpay_dollar"]: parseFloat(value.toFixed(2))
                }
            })

        }

    }

    const handleShowCalc = () => {

        setShowCalc(!show_calc)
        if (show_calc) {
            const monthly_breakdown = document.getElementById("monthly_breakdown")
            if (monthly_breakdown) {
                monthly_breakdown.innerHTML = ""
            }
        }

    }

    const CalculateMortagage = () => {

        const downPayment = parseFloat(calc_data.downpay_dollar.toString());
        const propertyPrice = parseFloat(calc_data.property_price.toString());
        const interestRate = parseFloat(calc_data.interest_rate.toString()) / 100;
        const mortgageLength = parseFloat(calc_data.length_of_mortgage.toString());
        const monthlyInterestRate = interestRate / 12;
        const numberOfPayments = mortgageLength * 12;
        const principal = propertyPrice - downPayment;
        const monthlyPayment = (principal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
        setMonthlyPayment(new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(monthlyPayment))

        let appendTo = document.getElementById("further_brk_dwn")
        if (appendTo) {

            appendTo.innerHTML = `
            <li><strong>The down payment</strong> = The price of the home multiplied by the percentage down
            divided by 100 (for ${calc_data.downpay_percent}% down ,br/> becomes ${calc_data.downpay_percent}/100 or ${calc_data.downpay_percent / 100}) 
            ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(downPayment)} = ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(propertyPrice - downPayment)} X (${calc_data.downpay_percent} / 100)
            </li>

            <li><strong>The interest rate</strong> = The annual interest percentage divided by 100 <br/>
            ${interestRate / 100} = ${interestRate}% / 100
            </li>

            <li><strong>The monthly interest rate</strong> = The annual interest rate divided by 12 (for the 12 months in a year)<br/>
            ${(interestRate / 100) / 12} = ${interestRate / 100} / 12
            </li>

            <li><strong>The month term of the loan in months</strong> = The number of years you've taken the loan out for times 12<br/>
            ${numberOfPayments} Months = ${mortgageLength} Years X 12
            </li>

            <li>The monthly payment is figured out using the following <strong>formula</strong>:<br/>
            <div class='w-full my-3'>
            <div class='flex items-center font-play-fair-display'>
                <div class='text-4xl'>
                    M = P
                </div>
                <div class='text-3xl flex flex-col divide-y-2 ml-4'>
                    <div>r (1 + r)<sup>n</sup></div>
                    <div>(1 + r)<sup>n</sup> - 1</div>
                </div>
            </div>
            </div>
            <div class='w-full'>
            Monthly Payment = ${principal} * (${interestRate / 100} / (1 - ((1 + ${interestRate / 100}) - ${numberOfPayments})))
            </div>
            </li>
            `
        }

        if (show_calc) {
            let remainingBalance = principal;
            let output = '<div class="w-full px-4 py-3 bg-gray-100 font-semibold"><h3>Year 1</h3></div>';

            output += `<div class="!w-full !max-w-[100%] overflow-x-auto py-3 px-4 border border-gray-200 mb-5"><table class="table table-auto w-[900px] lg:w-full"><tr><th>Month</th><th>Interest Paid</th><th>Principal Paid</th>
        <th>Remaining Balance</th></tr>`;

            let k = 1;
            for (let i = 1; i <= numberOfPayments; i++) {

                const interestPaid = remainingBalance * monthlyInterestRate;
                const principalPaid = monthlyPayment - interestPaid;
                remainingBalance -= principalPaid;

                output += `<tr class="*:p-3 border-b border-gray-200">
                    <td>${k}</td>
                    <td>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(interestPaid)}</td>
                    <td>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(principalPaid)}</td>
                    <td>${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(remainingBalance)}</td>
                </tr>`;

                if (i % 12 === 0 && i !== numberOfPayments) {
                    output += '</table></div>';
                    output += `<div class="w-full px-4 py-3 bg-gray-100 font-semibold"><h3>Year ${(i / 12) + 1}</h3></h3></div><h3>`;
                    output += `<div class="!w-full !max-w-[100%] overflow-x-auto py-3 px-4 border border-gray-200 mb-5"><table class="table table-auto w-[900px] lg:w-full">
                <tr><th>Month</th><th>Interest Paid</th><th>Principal Paid</th><th>Remaining Balance</th></tr>`;
                }

                if (k == 12) {
                    k = 0;
                }
                k++;
            }

            output += '</table></div>';

            const monthly_breakdown = document.getElementById("monthly_breakdown")
            if (monthly_breakdown) {
                monthly_breakdown.innerHTML = output
            }

        } else {
            const monthly_breakdown = document.getElementById("monthly_breakdown")
            if (monthly_breakdown) {
                monthly_breakdown.innerHTML = ""
            }
        }

    }

    const crumb = <><Link href="/"> Home</Link> <span>/</span> <Link href="/mortgage-calculator">Mortgage Calculator</Link></>

    return (
        <>
            <HeroHeader page="Has Hero" bg_image={`${comp_info.calculator_header?.image_loc ? comp_info.calculator_header?.image_loc : '../mortgage-calculator.jpg'}`} crumb={crumb} max_width={1000} />
            <section className='w-full bg-white py-10 md:py-20'>
                <div className='container mx-auto max-w-[1000px] px-3 xl:px-0 text-left'>
                    <h3 className='w-full font-play-fair-display text-3xl md:text-5xl'>Mortgage Calculator</h3>

                    <div className='w-full mt-8'>
                        <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-5'>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='property_price'>
                                    <span>Property Price</span>
                                </label>
                                <div className='flex items-center'>
                                    <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>$</div>
                                    <div className='flex-grow'>
                                        <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                        focus:shadow-md' placeholder='Property Price' value={calc_data.property_price} name='property_price'
                                            onChange={(e) => handleChange(e)} />
                                    </div>
                                </div>
                            </div>

                            <div className='w-full grid grid-cols-5 gap-0'>
                                <div className='col-span-3'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='downpay_dollar'>
                                        <span>Downpayment</span>
                                    </label>
                                    <div className='flex items-center'>
                                        <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>$</div>
                                        <div className='flex-grow'>
                                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                                focus:shadow-md appearance-none' type='number' placeholder='In Dollar' value={calc_data.downpay_dollar}
                                                name='downpay_dollar' id='downpay_dollar' onChange={(e) => handleDpChange(e)} />
                                        </div>
                                    </div>
                                </div>

                                <div className='col-span-2'>
                                    <label className='w-full flex items-center font-semibold' htmlFor='downpay_percent'>
                                        <span className='text-white select-none'>-</span>
                                    </label>
                                    <div className='flex items-center'>
                                        <div className='flex-grow'>
                                            <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                            focus:shadow-md' type='number appearance-none' placeholder='In Percentage' value={calc_data.downpay_percent}
                                                name='downpay_percent' id="downpay_percent" onChange={(e) => handleDpChange(e)} />
                                        </div>
                                        <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>%</div>
                                    </div>
                                </div>
                            </div>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='length_of_mortgage'>
                                    <span>Length of Mortgage</span>
                                </label>
                                <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                focus:shadow-md' type='number appearance-none' placeholder='First Name' value={calc_data.length_of_mortgage}
                                    name='length_of_mortgage' onChange={(e) => handleChange(e)} />
                            </div>

                            <div className=''>
                                <label className='w-full flex items-center font-semibold' htmlFor='interest_rate'>
                                    <span>Annual Interest Rate</span>
                                </label>
                                <div className='flex items-center'>
                                    <div className='flex-grow'>
                                        <input className='w-full h-11 border border-gray-300 px-2 outline-0 hover:border-sky-600 font-normal
                                            focus:shadow-md' type='number appearance-none' placeholder='Annual Interest Rate'
                                            value={calc_data.interest_rate} name='interest_rate' onChange={(e) => handleChange(e)} />
                                    </div>
                                    <div className='py-2 bg-gray-200 h-11 px-4 border border-gray-300 text-gray-700'>%</div>
                                </div>
                            </div>

                            <div className='sm:col-span-2 relative flex items-center'>
                                <input type='checkbox' className='styled-checkbox' name='show_calc' id='show_calc' checked={show_calc}
                                    onChange={handleShowCalc} />
                                <label className='' htmlFor="show_calc">
                                    <span className=''>Show me the calculations and amortization</span>
                                </label>
                            </div>

                            <div className='sm:col-span-2 my-4'>
                                THIS MORTGAGE CALCULATOR CAN BE USED TO FIGURE OUT MONTHLY PAYMENTS OF A HOME MORTGAGE LOAN,
                                BASED ON THE HOME'S SALE PRICE, THE TERM OF THE LOAN DESIRED, BUYER'S DOWN PAYMENT PERCENTAGE,
                                AND THE LOAN'S INTEREST RATE.
                            </div>

                            <div className='sm:col-span-2'>
                                <button className='bg-primary text-white px-5 py-3 float-right font-normal hover:bg-primary/90'
                                    onClick={CalculateMortagage}>
                                    Calculate
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='w-full mt-8' id='result_area'>
                        <div className='w-full flex flex-col justify-center'>
                            <div className='float-none w-full flex flex-col items-center justify-center'>
                                <h1 className='text-5xl font-bold'>{monthly_payment}</h1>
                                <h2 className='font-semibold mt-2 text-xl'>Your estimated monthly payment.</h2>
                            </div>
                            <div className={`float-none w-full mt-8  ${!show_calc ? "hidden" : ""}`} id='calculation_area'>

                                <div className='w-full font-play-fair-display text-2xl font-semibold'>Calculations and Amortization</div>
                                <div className='w-full mt-2'>
                                    <ol className='list-decimal pl-4 *:mb-4 *:font-normal' id="further_brk_dwn"></ol>
                                </div>

                            </div>
                        </div>

                        <div className={`w-full mt-8 overflow-x-auto ${!show_calc ? "hidden" : ""}`} id='monthly_breakdown'></div>

                    </div>
                </div>
            </section>

        </>
    )
}

export default MortgageCalculator