# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@services
Feature: Services page

  @TC-SERV-001 @smoke @regression @priority-high
  Scenario: TC-SERV-001: All six services are listed
    # Priority: High | Type: Content | Page: Services
    Given I open the "Services" page
    Then I should see the following service cards:
      | Software Testing |
      | Test Management |
      | Test Leadership |
      | UAT Management |
      | Test Automation |
      | QA Consultancy |

  @TC-SERV-002 @regression @priority-medium
  Scenario Outline: TC-SERV-002: Each service can be linked to directly
    # Priority: Medium | Type: Navigation | Page: Services
    Given I open the path "services.html#<anchor>"
    Then the "<service>" service card should be in view

    Examples:
      | service | anchor |
      | Software Testing | testing |
      | Test Management | test-management |
      | Test Leadership | test-lead |
      | UAT Management | uat |
      | Test Automation | automation |
      | QA Consultancy | consultancy |

  @TC-SERV-003 @regression @priority-low
  Scenario Outline: TC-SERV-003: Each service card lists what is included
    # Priority: Low | Type: Content | Page: Services
    Given I open the "Services" page
    Then the "<service>" service card should list <count> items

    Examples:
      | service | count |
      | Software Testing | 7 |
      | Test Management | 6 |
      | Test Leadership | 6 |
      | UAT Management | 6 |
      | Test Automation | 5 |
      | QA Consultancy | 4 |

  @TC-SERV-004 @smoke @regression @priority-high
  Scenario: TC-SERV-004: The "Get in touch" button opens the contact section
    # Priority: High | Type: Navigation | Page: Services; Home
    Given I open the "Services" page
    When I click the "Get in touch" link
    Then the URL should end with "index.html#contact"
    And the section headed "Let's talk about your next project" should be in view
