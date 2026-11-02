# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@navigation
Feature: Site navigation

  @TC-NAV-001 @smoke @regression @priority-high
  Scenario Outline: TC-NAV-001: Each page loads with the correct title and main heading
    # Priority: High | Type: Functional | Page: All pages
    Given I open the "<page>" page
    Then the page title should be "<title>"
    And the main heading should be "<heading>"

    Examples:
      | page | title | heading |
      | Home | Autolytics IT Consultancy \| Software Testing & Test Management | Software testing you can ship with confidence |
      | About Me | About Me \| Autolytics IT Consultancy | About Me |
      | Services | Services \| Autolytics IT Consultancy | Services |
      | Experience | Experience \| Autolytics IT Consultancy | Experience |

  @TC-NAV-002 @smoke @regression @priority-high
  Scenario Outline: TC-NAV-002: Header navigation links take the visitor to the correct page
    # Priority: High | Type: Navigation | Page: All pages
    Given I open the "<start page>" page
    When I click the "<link>" link in the header navigation
    Then I should be on the "<destination>" page
    And the main heading should be "<heading>"

    Examples:
      | start page | link | destination | heading |
      | Home | About Me | About Me | About Me |
      | Home | Services | Services | Services |
      | Home | Experience | Experience | Experience |
      | About Me | Home | Home | Software testing you can ship with confidence |
      | Services | About Me | About Me | About Me |
      | Experience | Services | Services | Services |

  @TC-NAV-003 @regression @priority-medium
  Scenario Outline: TC-NAV-003: The current page is highlighted in the header navigation
    # Priority: Medium | Type: Navigation | Page: All pages
    Given I open the "<page>" page
    Then the "<page>" link in the header navigation should be marked as the current page
    And only one header navigation link should be marked as the current page

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |

  @TC-NAV-004 @regression @priority-medium
  Scenario Outline: TC-NAV-004: The site logo returns the visitor to the home page
    # Priority: Medium | Type: Navigation | Page: About Me; Services; Experience
    Given I open the "<page>" page
    When I click the site logo
    Then I should be on the "Home" page

    Examples:
      | page |
      | About Me |
      | Services |
      | Experience |

  @TC-NAV-005 @smoke @regression @priority-high
  Scenario Outline: TC-NAV-005: The Contact link opens the contact section of the home page
    # Priority: High | Type: Navigation | Page: Services; Experience; Home
    Given I open the "<page>" page
    When I click the "Contact" link in the header navigation
    Then the URL should end with "index.html#contact"
    And the section headed "Let's talk about your next project" should be in view

    Examples:
      | page |
      | Services |
      | Experience |

  @TC-NAV-006 @regression @priority-high
  Scenario Outline: TC-NAV-006: Internal links and page anchors are not broken
    # Priority: High | Type: Navigation | Page: All pages
    Given I open the "<page>" page
    Then every internal link on the page should resolve

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |

  @TC-NAV-007 @smoke @regression @priority-high
  Scenario Outline: TC-NAV-007: Pages load without JavaScript errors or missing files
    # Priority: High | Type: Functional | Page: All pages
    Given I open the "<page>" page
    Then there should be no JavaScript errors on the page

    Examples:
      | page |
      | Home |
      | About Me |
      | Services |
      | Experience |
