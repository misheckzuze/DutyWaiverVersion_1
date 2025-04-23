"use client";
import React, { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { AuthenticatedUser } from "@/utils/AuthenticatedUser";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [form, setForm] = useState({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
  });

  useEffect(() => {
    const userDetails = AuthenticatedUser.getUserDetails();
    if (userDetails) {
      setForm({
        id: userDetails.id || "",
        firstName: userDetails.firstName || "",
        lastName: userDetails.lastName || "",
        email: userDetails.email || "",
        phone: userDetails.phone || "",
        role: userDetails.role || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saving changes...", form);
    closeModal();
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">First Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{form.firstName}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Last Name</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{form.lastName}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email Address</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{form.email}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{form.phone}</p>
            </div>

            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{form.role}</p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.091 2.782a2.25 2.25 0 0 0-3.182 0l-7.334 7.334a2.25 2.25 0 0 0-.61 1.126l-.652 2.092a.75.75 0 0 0 .909.909l2.093-.652a2.25 2.25 0 0 0 1.126-.61l7.334-7.334a2.25 2.25 0 0 0 0-3.182l-.663-.663zm-2.122 1.06a.75.75 0 0 1 1.06 0l.663.663a.75.75 0 0 1 0 1.06l-.65.651-1.723-1.723.65-.651z"
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                Edit Personal Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input name="firstName" type="text" value={form.firstName} onChange={handleChange} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input name="lastName" type="text" value={form.lastName} onChange={handleChange} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" value={form.email} onChange={handleChange} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" type="text" value={form.phone} onChange={handleChange} />
                </div>
                <div className="col-span-2">
                  <Label>Role</Label>
                  <Input name="role" type="text" value={form.role} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
