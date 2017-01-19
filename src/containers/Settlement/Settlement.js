import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { Link } from 'react-router'
import ReactTooltip from 'react-tooltip'

import { load } from 'redux/actions/settlement_method'

import SettlementAddButton from 'containers/SettlementAddButton/SettlementAddButton'
import SettlementMethod from 'containers/SettlementMethod/SettlementMethod'

import classNames from 'classnames/bind'
import styles from './Settlement.scss'
const cx = classNames.bind(styles)

@connect(state => ({
  list: state.settlementMethod.list
}), { load })
export default class Settlement extends Component {
  static propTypes = {
    children: PropTypes.object,
    load: PropTypes.func.isRequired,
    list: PropTypes.array
  }

  state = {}

  componentWillMount() {
    this.props.load()
  }

  renderLogo = method => {
    if (method.type === 'paypal') return <img src={require('./paypal.png')} />
    if (method.type === 'bitcoin') return <img src={require('./bitcoin.png')} />
    if (method.type === 'ripple') return <img src={require('./ripple.png')} />
    if (method.type === 'etherium') return <img src={require('./etherium.png')} />

    if (!method.logo) {
      return method.name || 'Unnamed'
    }
  }

  renderSettlementMethod = method => {
    return (
      <Link to={'/settlement/' + method.id} className={cx('panel', 'panel-default', 'option')} key={method.id}>
        {method.enabled
          ? <i className={cx('enabled', 'fa', 'fa-circle', 'icon')} data-tip="Enabled" />
          : <i className={cx('disabled', 'fa', 'fa-circle', 'icon')} data-tip="Disabled" />}

        <div className="panel-body">
          {this.renderLogo(method)}
        </div>

        <ReactTooltip />
      </Link>
    )
  }

  render() {
    const { children } = this.props
    const list = this.props.list || []

    return (
      <div className={cx('Settlement')}>
        <Helmet title={'Settlement'} />

        <div className={cx('row', 'list')}>
          <div className={cx('col-sm-4')}>
            {list && list.map(this.renderSettlementMethod)}

            <SettlementAddButton className={cx('option')} />
          </div>
          <div className={cx('col-sm-8')}>
            <div className={cx('panel', 'panel-default')}>
              <div className="panel-body">
                {/* TODO:BEFORE_DEPLOY handle not custom types */}
                {children}

                {list.length < 1 &&
                <div className={cx('noResults')}>
                  <i className={cx('fa', 'fa-credit-card-alt')} />
                  <h1>No Settlement Methods</h1>
                  <div>Use the button on the left to add your first settlement method</div>
                </div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
