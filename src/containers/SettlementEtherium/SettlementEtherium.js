import React, { Component } from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import classNames from 'classnames/bind'
import styles from './SettlementEtherium.scss'
const cx = classNames.bind(styles)

@connect(
  state => ({

  }),
  {})
export default class SettlementEtherium extends Component {
  static propTypes = {
  }

  render () {
    return (
      <div className={cx('SettlementEtherium')}>
        <Helmet title={'Etherium - Settlement'} />

        Etherium
      </div>
    )
  }
}
