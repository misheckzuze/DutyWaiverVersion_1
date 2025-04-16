import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CheckboxComponents from "@/components/form/form-elements/CheckboxComponents";
import DefaultInputs from "@/components/form/form-elements/DefaultInputs";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import FileInputExample from "@/components/form/form-elements/FileInputExample";
import InputGroup from "@/components/form/form-elements/InputGroup";
import InputStates from "@/components/form/form-elements/InputStates";
import RadioButtons from "@/components/form/form-elements/RadioButtons";
import SelectInputs from "@/components/form/form-elements/SelectInputs";
import TextAreaInput from "@/components/form/form-elements/TextAreaInput";
import ToggleSwitch from "@/components/form/form-elements/ToggleSwitch";
import { Metadata } from "next";
import React from "react";
import NewApplicationForm from "@/components/applications/apply/NewApplicationForm";

export const metadata: Metadata = {
  title: "New Duty Waiver Application | Duty Waiver System",
  description:
    "This is the New Duty Waiver Application page for Duty Waiver System",
  keywords: "Duty Waiver, New Application, Dashboard",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Duty Waiver Application Form" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-1 lg:grid-cols-1">
        <NewApplicationForm />
        {/* <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div> */}
        {/* <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div> */}
      </div>
    </div>
  );
}
