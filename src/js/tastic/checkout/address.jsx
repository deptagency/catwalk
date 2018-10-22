import React, { Component } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'

class Address extends Component {
    constructor (props) {
        super(props)

        this.state = {
            firstName: '',
            lastName: '',
            streetName: '',
            streetNumber: '',
            additionalStreetInfo: '',
            postalCode: '',
            city: '',
            country: 'DE',
        }
    }

    debouncedUpdate = _.debounce(() => {
        this.props.onChange(this.state)
    }, 200)

    updateState = (stateChange) => {
        this.setState(stateChange)
        this.debouncedUpdate()
    }

    render () {
        return (<div className='c-form o-layout'>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_firstName'} className='c-form__label'>Vorname</label>
                <input
                    id={'checkout_' + this.props.scope + '_firstName'}
                    className='c-form__input'
                    type='text'
                    required
                    autoComplete='fname'
                    value={this.state.firstName}
                    onChange={(event) => {
                        this.updateState({ firstName: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_lastName'} className='c-form__label'>Nachname</label>
                <input
                    id={'checkout_' + this.props.scope + '_lastName'}
                    className='c-form__input'
                    type='text'
                    required
                    autoComplete='lname'
                    value={this.state.lastName}
                    onChange={(event) => {
                        this.updateState({ lastName: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_streetName'} className='c-form__label'>Straße</label>
                <input
                    id={'checkout_' + this.props.scope + '_streetName'}
                    className='c-form__input'
                    type='text'
                    required
                    autoComplete={this.props.scope + ' address-line1'}
                    value={this.state.streetName}
                    onChange={(event) => {
                        this.updateState({ streetName: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_streetNumber'} className='c-form__label'>Hausnummer</label>
                <input
                    id={'checkout_' + this.props.scope + '_streetNumber'}
                    className='c-form__input'
                    type='text'
                    required
                    autoComplete={this.props.scope + ' address-line2'}
                    value={this.state.streetNumber}
                    onChange={(event) => {
                        this.updateState({ streetNumber: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1'>
                <label htmlFor={'checkout_' + this.props.scope + '_additionalStreetInfo'} className='c-form__label'>Zusatz</label>
                <input
                    id={'checkout_' + this.props.scope + '_additionalStreetInfo'}
                    className='c-form__input'
                    type='text'
                    autoComplete={this.props.scope + ' address-line3'}
                    value={this.state.additionalStreetInfo}
                    onChange={(event) => {
                        this.updateState({ additionalStreetInfo: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_postalCode'} className='c-form__label'>PLZ</label>
                <input
                    id={'checkout_' + this.props.scope + '_postalCode'}
                    className='c-form__input'
                    type='number'
                    required
                    autoComplete={this.props.scope + ' postal-code'}
                    value={this.state.postalCode}
                    onChange={(event) => {
                        this.updateState({ postalCode: event.target.value })
                    }}
                />
            </div>
            <div className='c-form__item o-layout__item u-1/1 u-1/2@lap'>
                <label htmlFor={'checkout_' + this.props.scope + '_city'} className='c-form__label'>Stadt</label>
                <input
                    id={'checkout_' + this.props.scope + '_city'}
                    className='c-form__input'
                    type='text'
                    required
                    autoComplete={this.props.scope + ' address-level2'}
                    value={this.state.city}
                    onChange={(event) => {
                        this.updateState({ city: event.target.value })
                    }}
                />
            </div>
        </div>)
    }
}

Address.propTypes = {
    onChange: PropTypes.func.isRequired,
    scope: PropTypes.string,
}

Address.defaultProps = {
    scope: 'shipping',
}

export default Address
