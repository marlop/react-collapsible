import React, { Component } from 'react';
import PropTypes from 'prop-types';
export default class Collapsible extends Component {
  constructor(props) {
    super(props);
    this.timeout = undefined;

    // Defaults the dropdown to be closed
    if (props.open) {
      this.state = {
        isClosed: false,
        shouldSwitchAutoOnNextCycle: false,
        height: 'auto',
        transition: 'none',
        hasBeenOpened: true,
        overflow: props.overflowWhenOpen,
        inTransition: false,
      };
    } else {
      this.state = {
        isClosed: true,
        shouldSwitchAutoOnNextCycle: false,
        height: 0,
        transition: `height ${props.transitionTime}ms ${props.easing}`,
        hasBeenOpened: false,
        overflow: 'hidden',
        inTransition: false,
      };
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.shouldOpenOnNextCycle) {
      this.continueOpenCollapsible();
    }

    if (prevState.height === 'auto' && this.state.shouldSwitchAutoOnNextCycle === true) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => {
        // Set small timeout to ensure a true re-render
        this.setState({
          height: 0,
          overflow: 'hidden',
          isClosed: true,
          shouldSwitchAutoOnNextCycle: false,
        });
      }, 50);
    }

    // If there has been a change in the open prop (controlled by accordion)
    if (prevProps.open !== this.props.open) {
      if (this.props.open === true) {
        this.openCollapsible();
        this.props.onOpening();
      } else {
        this.closeCollapsible();
        this.props.onClosing();
      }
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  closeCollapsible() {
    this.setState({
      shouldSwitchAutoOnNextCycle: true,
      height: this.innerRef.scrollHeight,
      transition: `height ${
        this.props.transitionCloseTime ? this.props.transitionCloseTime : this.props.transitionTime
      }ms ${this.props.easing}`,
      inTransition: true,
    });
  }

  openCollapsible() {
    this.setState({
      inTransition: true,
      shouldOpenOnNextCycle: true,
    });
  }

  continueOpenCollapsible = () => {
    this.setState({
      height: this.innerRef.scrollHeight,
      transition: `height ${this.props.transitionTime}ms ${this.props.easing}`,
      isClosed: false,
      hasBeenOpened: true,
      inTransition: true,
      shouldOpenOnNextCycle: false,
    });
  };

  handleTriggerClick = event => {
    if (this.props.triggerDisabled) {
      return;
    }

    event.preventDefault();

    if (this.props.handleTriggerClick) {
      this.props.handleTriggerClick(this.props.accordionPosition);
    } else {
      if (this.state.isClosed === true) {
        this.openCollapsible();
        this.props.onOpening();
      } else {
        this.closeCollapsible();
        this.props.onClosing();
      }
    }
  };

  renderNonClickableTriggerElement() {
    if (this.props.triggerSibling && typeof this.props.triggerSibling === 'string') {
      return (
        <span className={`${this.props.classParentString}__trigger-sibling`}>
          {this.props.triggerSibling}
        </span>
      );
    } else if (this.props.triggerSibling) {
      return <this.props.triggerSibling />;
    }

    return null;
  }

  handleTransitionEnd = () => {
    // Switch to height auto to make the container responsive
    if (!this.state.isClosed) {
      this.setState({ height: 'auto', overflow: this.props.overflowWhenOpen, inTransition: false });
      this.props.onOpen();
    } else {
      this.setState({ inTransition: false });
      this.props.onClose();
    }
  };

  render() {
    var dropdownStyle = {
      height: this.state.height,
      WebkitTransition: this.state.transition,
      msTransition: this.state.transition,
      transition: this.state.transition,
      overflow: this.state.overflow,
    };

    var toggleClassName = this.state.isClosed ? 'is-closed' : 'is-open';
    var disabledClass = this.props.triggerDisabled ? 'is-disabled' : '';

    // If user wants different text when tray is open
    var trigger =
      this.state.isClosed === false && this.props.triggerWhenOpen !== undefined
        ? this.props.triggerWhenOpen
        : this.props.trigger;

    // If user wants a trigger wrapping element different than 'span'
    const TriggerElement = this.props.triggerTagName;

    // Don't render children until the first opening of the Collapsible if lazy rendering is enabled
    var children =
      this.props.lazyRender &&
      !this.state.hasBeenOpened &&
      this.state.isClosed &&
      !this.state.inTransition
        ? null
        : this.props.children;

    const className = this.props.className;
    const openedClassName = this.props.classNameOpen;
    const closedClassName = this.props.classNameClosed;

    // Construct CSS classes strings
    const triggerClassString = `${
      this.props.classParentString
    }__trigger ${toggleClassName} ${disabledClass} ${
      this.state.isClosed ? this.props.triggerClassName : this.props.triggerOpenedClassName
    }`;
    const outerClassString = `${this.props.classParentString}__contentOuter ${
      this.props.contentOuterClassName
    }`;
    const innerClassString = `${this.props.classParentString}__contentInner ${
      this.props.contentInnerClassName
    }`;

    return (
      <div
        className={`${this.props.classParentString} ${className} ${
          this.state.isClosed ? closedClassName : openedClassName
        }`}
      >
        <TriggerElement
          className={triggerClassString.trim()}
          onClick={this.handleTriggerClick}
          style={this.props.triggerStyle && this.props.triggerStyle}
          onKeyPress={event => {
            const { key } = event;
            if (key === ' ' || key === 'Enter') {
              this.handleTriggerClick(event);
            }
          }}
          tabIndex={this.props.tabIndex && this.props.tabIndex}
        >
          {trigger}
        </TriggerElement>

        {this.renderNonClickableTriggerElement()}

        <div
          className={outerClassString.trim()}
          style={dropdownStyle}
          onTransitionEnd={this.handleTransitionEnd}
          ref={ref => (this.innerRef = ref)}
        >
          <div className={innerClassString.trim()}>{children}</div>
        </div>
      </div>
    );
  }
}

Collapsible.propTypes = {
  accordionPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  classNameClosed: PropTypes.string,
  classNameOpen: PropTypes.string,
  classParentString: PropTypes.string,
  contentInnerClassName: PropTypes.string,
  contentOuterClassName: PropTypes.string,
  easing: PropTypes.string,
  handleTriggerClick: PropTypes.func,
  lazyRender: PropTypes.bool,
  onClose: PropTypes.func,
  onClosing: PropTypes.func,
  onOpen: PropTypes.func,
  onOpening: PropTypes.func,
  open: PropTypes.bool,
  overflowWhenOpen: PropTypes.oneOf([
    'hidden',
    'visible',
    'auto',
    'scroll',
    'inherit',
    'initial',
    'unset',
  ]),
  tabIndex: PropTypes.number,
  transitionCloseTime: PropTypes.number,
  transitionTime: PropTypes.number,
  trigger: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  triggerClassName: PropTypes.string,
  triggerDisabled: PropTypes.bool,
  triggerOpenedClassName: PropTypes.string,
  triggerSibling: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
  triggerStyle: PropTypes.object,
  triggerTagName: PropTypes.string,
  triggerWhenOpen: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

Collapsible.defaultProps = {
  className: '',
  classNameClosed: '',
  classNameOpen: '',
  classParentString: 'Collapsible',
  contentInnerClassName: '',
  contentOuterClassName: '',
  easing: 'linear',
  lazyRender: false,
  onClose: () => {},
  onClosing: () => {},
  onOpen: () => {},
  onOpening: () => {},
  open: false,
  overflowWhenOpen: 'hidden',
  tabIndex: null,
  transitionCloseTime: null,
  transitionTime: 400,
  triggerClassName: '',
  triggerDisabled: false,
  triggerOpenedClassName: '',
  triggerSibling: null,
  triggerStyle: null,
  triggerTagName: 'span',
};
