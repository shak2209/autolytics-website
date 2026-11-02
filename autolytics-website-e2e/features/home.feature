# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@home
Feature: Home page

  @TC-HOME-001 @smoke @regression @priority-high
  Scenario Outline: TC-HOME-001: Hero buttons open the matching pages
    # Priority: High | Type: Navigation | Page: Home
    Given I open the "Home" page
    When I click the "<button>" link
    Then I should be on the "<destination>" page

    Examples:
      | button | destination |
      | Our services | Services |
      | View experience | Experience |

  @TC-HOME-002 @regression @priority-medium
  Scenario: TC-HOME-002: Key statistics are displayed
    # Priority: Medium | Type: Content | Page: Home
    Given I open the "Home" page
    Then I should see the following statistics:
      | value | label |
      | 13+ | Years in software testing |
      | 8 | Organisations supported |
      | 5 | Sectors: health, retail, finance, logistics, property |
      | ISTQB | & Certified Agile Tester |

  @TC-HOME-003 @regression @priority-medium
  Scenario: TC-HOME-003: The "What we do" section shows the four core services
    # Priority: Medium | Type: Content | Page: Home
    Given I open the "Home" page
    Then I should see the following service cards:
      | Software Testing |
      | Test Management |
      | Test Leadership |
      | Test Automation |

  @TC-HOME-004 @regression @priority-high
  Scenario Outline: TC-HOME-004: "Learn more" links open the matching service on the Services page
    # Priority: High | Type: Navigation | Page: Home; Services
    Given I open the "Home" page
    When I click "Learn more" on the "<service>" card
    Then I should be on the "Services" page
    And the URL should end with "services.html#<anchor>"
    And the "<service>" service card should be in view

    Examples:
      | service | anchor |
      | Software Testing | testing |
      | Test Management | test-management |
      | Test Leadership | test-lead |
      | Test Automation | automation |

  @TC-HOME-005 @regression @priority-low
  Scenario: TC-HOME-005: Sector tags are displayed
    # Priority: Low | Type: Content | Page: Home
    Given I open the "Home" page
    Then the tags under the "Trusted across sectors" heading should be:
      | Healthcare |
      | Ecommerce & Retail |
      | Financial Services |
      | Logistics |
      | Property |
      | Cloud Transformation |
      | System Migration |

  @TC-HOME-006 @smoke @regression @priority-high
  Scenario: TC-HOME-006: The LinkedIn contact button opens the LinkedIn profile in a new tab
    # Priority: High | Type: Functional | Page: Home
    Given I open the "Home" page
    Then the "Connect on LinkedIn" link should open "https://www.linkedin.com/in/shakeel-malik-75149a85/" in a new tab

  @TC-HOME-007 @smoke @regression @priority-high
  Scenario: TC-HOME-007: The contact section shows a clickable contact email address
    # Priority: High | Type: Content | Page: Home
    Given I open the "Home" page
    Then the contact section should show the email address "Autolytics@outlook.com"
