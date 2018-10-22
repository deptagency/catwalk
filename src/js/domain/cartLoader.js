import _ from 'lodash'

import Cart from './cart'
import app from '../app/app'
import Entity from '../app/entity'

/**
 * Loader classes like this consilidate all loading monitors for a domain
 * concept.
 *
 * They define one (or multiple) load() methods which execute an AJAX call
 * through the Api. You may implement parameter remapping and cache checks in
 * here. For the loaded date there should be a dispatched action through Redux.
 *
 * The Loader also defines a (static) method which handles its own actions and
 * applies the corresponding changes to the global store state.
 */
let CartLoader = function (store, api) {
    this.store = store
    this.api = api

    this.get = (parameters = {}) => {
        this.api.triggerContinuously('Frontastic.CartApi.Cart.get', parameters)
    }

    this.getOrder = (parameters = {}) => {
        this.api.trigger('Frontastic.CartApi.Cart.getOrder', parameters)
    }

    this.setProductOption = (productId, option) => {
        this.store.dispatch({
            type: 'CartApi.Cart.productOption',
            productId: productId,
            option: option,
        })
    }

    this.add = (product, variant, count, option = null) => {
        this.store.dispatch({
            type: 'CartApi.Cart.loading',
        })

        this.api.request(
            'POST',
            'Frontastic.CartApi.Cart.add',
            null,
            { product, variant, count, option },
            (data) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.add.success',
                    data: data,
                })
            },
            (error) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.add.error',
                    error: error,
                })
            }
        )
    }

    this.updateLineItem = (update) => {
        this.store.dispatch({
            type: 'CartApi.Cart.loading',
        })

        this.api.request(
            'POST',
            'Frontastic.CartApi.Cart.updateLineItem',
            { ownErrorHandler: true },
            update,
            (data) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.update.success',
                    data: data,
                })
            },
            (error) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.update.error',
                    error: error,
                })
            }
        )
    }

    this.removeLineItem = (update) => {
        this.store.dispatch({
            type: 'CartApi.Cart.loading',
        })

        this.api.request(
            'POST',
            'Frontastic.CartApi.Cart.removeLineItem',
            { ownErrorHandler: true },
            update,
            (data) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.update.success',
                    data: data,
                })
            },
            (error) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.update.error',
                    error: error,
                })
            }
        )
    }

    this.checkout = (cartInformation) => {
        this.api.request(
            'POST',
            'Frontastic.CartApi.Cart.checkout',
            { ownErrorHandler: true },
            cartInformation,
            (data) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.checkout.success',
                    data: data,
                })
                app.getRouter().push(
                    'Frontastic.Frontend.Master.Checkout.finished',
                    { order: data.order.orderId }
                )
            },
            (error) => {
                this.store.dispatch({
                    type: 'CartApi.Cart.checkout.error',
                    error: error,
                })
            }
        )
    }
}

const initialGlobalState = {
    cart: null,
    orders: {},
    lastOrder: null,
    productOptions: {},
}

CartLoader.handleAction = (globalState = initialGlobalState, action) => {
    let cart = null
    let orders = {}
    let productOptions = {}

    switch (action.type) {
    case 'FRONTASTIC_ROUTE':
        return {
            cart: Entity.purge(globalState.cart),
            orders: Entity.purgeMap(globalState.orders),
            lastOrder: Entity.purge(globalState.lastOrder),
            productOptions: globalState.productOptions,
        }

    case 'CartApi.Cart.loading':
        cart = new Entity(globalState.cart.data)
        cart.loading = true

        return {
            ...globalState,
            cart: cart,
        }

    case 'CartApi.Cart.productOption':
        productOptions = _.extend(productOptions, globalState.productOptions)
        productOptions[action.productId] = action.option

        return {
            ...globalState,
            productOptions: productOptions,
        }

    case 'CartApi.Cart.get.success':
    case 'CartApi.Cart.add.success':
    case 'CartApi.Cart.update.success':
        return {
            ...globalState,
            cart: new Entity(new Cart(action.data.cart)),
        }
    case 'CartApi.Cart.get.error':
    case 'CartApi.Cart.add.error':
    case 'CartApi.Cart.update.error':
    case 'CartApi.Cart.checkout.error':
        return {
            ...globalState,
            cart: new Entity(globalState.cart.data).setError(action.error),
        }

    case 'CartApi.Cart.checkout.success':
        orders = _.extend(orders, globalState.orders)
        orders[action.data.order.orderId] = new Entity(action.data.order)

        return {
            ...globalState,
            cart: null,
            lastOrder: new Entity(new Cart(action.data.order)),
            orders: orders,
        }

    case 'CartApi.Cart.getOrder.success':
        orders = _.extend(orders, globalState.orders)
        orders[action.data.order.orderId] = new Entity(action.data.order)

        return {
            ...globalState,
            orders: orders,
        }

    default:
        // Do nothing for other actions
    }

    return globalState
}

export default CartLoader
