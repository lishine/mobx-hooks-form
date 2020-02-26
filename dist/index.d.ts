import React from 'react';
import * as yup from 'yup';
interface Values {
    [index: string]: yup.Schema<any>;
}
interface Touched {
    [index: string]: boolean;
}
interface Errors {
    [index: string]: string;
}
interface UseForm {
    scheme: yup.ObjectSchema<Values>;
    initialValues: Values;
    name: string;
}
declare class Store {
    constructor(props: UseForm);
    formName: string;
    scheme: yup.ObjectSchema<Values>;
    keys: string[];
    values: Values;
    touched: Touched;
    errors: Errors;
    get validations(): Errors;
    get isValid(): boolean;
    setValue: (key: string) => (value: any) => void;
    touch: (key: string) => boolean;
    touchAll: () => void;
    updateValues: (values: Values) => Values & Partial<Values>;
    handleChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckedChange: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur: (key: string) => () => void;
    getValue: (key: string) => yup.Schema<any>;
    getError: (key: string) => string;
    isRequired: (name: string) => any;
    handleSubmit: (submit: () => void) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}
export declare const useForm: (props: UseForm) => Store;
export declare const useFormContext: () => Store;
export declare const FormContextProvider: ({ children, formStore, }: {
    children: React.ReactChildren;
    formStore: Store;
}) => JSX.Element;
export declare const useFieldContext: () => {};
export declare const FieldContextProvider: React.FunctionComponent<{
    children: (arg0: any) => string | number | boolean | {} | React.ReactChildren | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | null | undefined;
    name: string;
}>;
export {};
