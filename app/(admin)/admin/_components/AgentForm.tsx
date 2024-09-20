import { ErrorMessage, Field, Form } from 'formik'
import React from 'react'

const AgentForm = ({ type }: { type: string }) => {
    return (
        <Form className='w-full'>
            <div className='w-full grid grid-cols-1 xs:grid-cols-2 gap-4'>

                <div className='col-span-1 xs:col-span-2'>
                    <label htmlFor="name" className='form-label'>Full Name</label>
                    <Field type="text" name="name" className='form-field' placeholder='Full Name' />
                    <ErrorMessage name="name" component="div" />
                </div>

                <div className='col-span-1 xs:col-span-2'>
                    <label htmlFor="email" className='form-label'>Email</label>
                    <Field type="email" name="email" className='form-field' placeholder="Email" />
                    <ErrorMessage name="email" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="phone" className='form-label'>Phone Number</label>
                    <Field type="tel" name="phone" className='form-field' placeholder="Phone Number" />
                    <ErrorMessage name="phone" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="role" className='form-label'>Role</label>
                    <Field type="text" name="role" className='form-field' placeholder="Role" />
                    <ErrorMessage name="role" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="license_number" className='form-label'>License Number</label>
                    <Field type="text" name="license_number" className='form-field' placeholder="License Number" />
                    <ErrorMessage name="license_number" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="facebook" className='form-label'>Facebook</label>
                    <Field type="text" name="facebook" className='form-field' placeholder="Phone Number" />
                    <ErrorMessage name="facebook" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="instagram" className='form-label'>Instagram</label>
                    <Field type="text" name="instagram" className='form-field' placeholder="Instagram" />
                    <ErrorMessage name="instagram" component="div" />
                </div>

                <div className='col-span-1'>
                    <label htmlFor="twitter" className='form-label'>X(Twitter)</label>
                    <Field type="text" name="twitter" className='form-field' placeholder="X(Twitter)" />
                    <ErrorMessage name="twitter" component="div" />
                </div>

                <div className='col-span-1 xs:col-span-2'>
                    <label htmlFor="bio" className='form-label'>Bio</label>
                    <Field as="textarea" name="bio" className='form-field resize-none h-48' placeholder="Bio" />
                    <ErrorMessage name="bio" component="div" />
                </div>

                <div className='col-span-1 xs:col-span-2 mt-4'>
                    <button type="submit" className='bg-gray-800 py-3 px-4 text-white float-right hover:bg-gray-700 hover:drop-shadow-md'>
                        {type == "Add" ? "Add New Agent" : "Update Info"}
                    </button>
                </div>
            </div>
        </Form>
    )
}

export default AgentForm