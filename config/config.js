module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'Google Custom Search Engine (CSE)',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'GOOG',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'Google Search Custom Search (CSE) allows the Polarity user to retrieve and display search results from Google Custom Search programmatically.',
  entityTypes: ['IPv4', 'IPv6', 'MD5', 'SHA1', 'SHA256', 'domain', 'email', 'url', 'IPv4CIDR', 'cve'],
  customTypes: [
    {
      key: 'search',
      regex: /\S[\s\S]{2,512}\S/
    }
  ],
  defaultColor: 'light-gray',
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  styles: ['./styles/style.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  onDemandOnly: true,
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'Valid Google CSE API Key',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'cx',
      name: 'Custom Search Engine ID',
      description: 'Google Custom Search Engine ID',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'maxResults',
      name: 'Maximum Number of Results to Return',
      description: 'Maximum number of search results to return',
      default: 5,
      type: 'number',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
