import './App.css';
import React, {useEffect} from 'react';
import {ApolloClient, ApolloProvider, gql, InMemoryCache, useMutation} from "@apollo/client";
import {Field, Form} from 'react-final-form'
import jwt from 'jsonwebtoken'
import {onError} from "@apollo/client/link/error";

const client = new ApolloClient({
    uri: process.env.REACT_APP_API_URL,
    cache: new InMemoryCache()
});

const QUERY = gql`
    mutation($email: String!, $password: String!, $status: String!, $secret: String!) {
        signup(email: $email, password: $password, status: $status, secret: $secret) {
            user {
                id
            }
        }
    }
`


function App() {
    return (
        <ApolloProvider client={client}>
            <Data/>
        </ApolloProvider>
    );
}

const Data = () => {
    return (
        <MyForm/>
    )
}

const EMAIL = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const PASS = /"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"/

const MyForm = () => {
    const onSubmit = ({email, password}) => {
        try {
            call({
                variables: {
                    status: 'OWNER',
                    email,
                    password,
                    secret: jwt.sign({status: 'admin'}, process.env.REACT_APP_APP_SECRET)
                }
            })
        } catch (e) {
            alert(e)
        }
    }
    const validate = ({email, password}) => {
        const errors = {}
        if (!email) {
            errors.email = 'Required'
        } else {
            if (!EMAIL.test(email)) {
                errors.email = 'Please enter a valid email address'
            }
        }
        if (!password) {
            errors.password = 'Required'
        }
        return errors
    }
    const [call, {
        data,
        error,
        loading,
        called
    }] = useMutation(QUERY)

    useEffect(() => {
        if (called && data && !error && !loading) {
            alert('Successfully registered')
            window.location.reload()
        }
    }, [called, data, error, loading])

    const link = onError(({graphQLErrors, networkError}) => {
        if (graphQLErrors)
            graphQLErrors.map(({message, locations, path}) =>
                console.log(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
                ),
            );

        if (networkError) console.log(`[Network error]: ${networkError}`);
    });
    return (<Form

        onSubmit={onSubmit}
        validate={validate}
        render={({
                     handleSubmit,
                     pristine,
                     submitting,
                     hasValidationErrors,
                     hasSubmitErrors,
                     valid,
                     errors: {errors}
                 }) => (
            <form style={{
                flex: 1,
                justifyContent: 'center',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                alignSelf: 'center',
                minWidth: 500,
                boxSizing: 'border-box'
            }}
                  onSubmit={handleSubmit}>
                <h2 style={{color: '#fff'}}>Register as Admin</h2>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'}}>
                    <label style={{color: '#fff', fontWeight: 'bold'}}>Email</label>
                    <Field name="email" component={FieldInput} placeholder="example@email.com"/>
                </div>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box'}}>
                    <label style={{color: '#fff', fontWeight: 'bold'}}>Password</label>
                    <Field name="password" type={'password'} component={FieldInput} placeholder="password12"/>
                </div>
                <button style={{
                    fontSize: 16,
                    color: '#fff',
                    outline: 'none',
                    padding: 10,
                    width: '100%',
                    fontWeight: 'bold',
                    backgroundColor: 'darkred',
                    borderWidth: 0,
                    borderRadius: 20,
                    alignSelf: 'center',
                    margin: 0
                }} type="submit">SUBMIT
                </button>
            </form>
        )}
    />)
}


export const FieldInput = ({
                               input,
                               meta: {
                                   touched,
                                   error,
                                   submitFailed,
                                   modifiedSinceLastSubmit,
                                   dirtySinceLastSubmit,
                                   ...meta
                               },
                               disabled,
                               placeholder,
                               autoComplete,
                               onBlur
                           }) => {
    return (
        <div>
            <input
                {...input}
                style={{
                    width: '100%',
                    padding: '10px 20px',
                    borderRadius: 5,
                    outline: 'none',
                    borderWidth: 0,
                    marginBottom: 20,
                    boxSizing: 'border-box'
                }}
                disabled={disabled}
                error={touched && error}
                placeholder={placeholder}
                autoComplete={autoComplete}
            />
            {error && submitFailed && !dirtySinceLastSubmit && <p>{error}</p>}
        </div>
    )
}

export default App
