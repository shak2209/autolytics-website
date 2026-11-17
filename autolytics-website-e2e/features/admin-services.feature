# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@admin-services
Feature: Services management

  @TC-SVC-001 @regression @admin @REQ-SVC-01 @priority-high
  Scenario: TC-SVC-001: Editors see the six current services and the edit controls
    # Priority: High | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    Then the services table should list:
      | Software Testing |
      | Test Management |
      | Test Leadership |
      | UAT Management |
      | Test Automation |
      | QA Consultancy |
    And the "Add service" button should be visible
    And the "Reset to original services" button should be visible

  @TC-SVC-002 @smoke @regression @admin @REQ-SVC-01 @priority-high
  Scenario: TC-SVC-002: An editor can add a service
    # Priority: High | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    When I click the "Add service" button
    And I fill in the service form:
      | Title | Security Testing Coordination |
      | Summary | Planning and tracking third-party security testing. |
      | Items | Scope the test\nTrack the findings |
    And I click the "Save service" button
    Then the status message should be "Service added."
    And the service form should be closed
    And the services table should list 7 services
    And the services table should include "Security Testing Coordination"

  @TC-SVC-003 @regression @admin @REQ-SVC-03 @priority-high
  Scenario: TC-SVC-003: An added service appears on the public Services page
    # Priority: High | Type: End-to-end | Page: Admin: Manage services; Services | Requirement: REQ-SVC-03
    Given I am signed in as the "Editor"
    When I add a service with the title "Security Testing Coordination"
    Then the status message should be "Service added."
    When I open the "Services" page
    Then I should see 7 service cards
    And the "Security Testing Coordination" service card should list the items:
      | First item |
      | Second item |
    When I open the path "services.html#security-testing-coordination"
    Then the "Security Testing Coordination" service card should be in view

  @TC-SVC-004 @regression @admin @REQ-SVC-03 @priority-medium
  Scenario: TC-SVC-004: Changes survive a page reload
    # Priority: Medium | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-03
    Given I am signed in as the "Editor"
    When I add a service with the title "Persistence Check"
    And I reload the page
    Then the services table should list 7 services
    And the services table should include "Persistence Check"

  @TC-SVC-005 @regression @admin @REQ-SVC-01 @REQ-SVC-03 @priority-high
  Scenario: TC-SVC-005: An editor can edit a service and the public page shows the change
    # Priority: High | Type: End-to-end | Page: Admin: Manage services; Services | Requirement: REQ-SVC-01, REQ-SVC-03
    Given I am signed in as the "Editor"
    When I click the "Edit Software Testing" button
    Then the service form should be open
    And the "Title" field should contain "Software Testing"
    And the "Summary" field should contain "Thorough testing from front end to back end."
    When I change the "Summary" field to "Updated summary for the testing service."
    And I click the "Save service" button
    Then the status message should be "Service updated."
    And the "Software Testing" row should show the summary "Updated summary for the testing service."
    When I open the "Services" page
    Then the "Software Testing" service card should have the summary "Updated summary for the testing service."

  @TC-SVC-006 @regression @admin @REQ-SVC-01 @REQ-SVC-03 @priority-medium
  Scenario: TC-SVC-006: Renaming a service keeps its existing link working
    # Priority: Medium | Type: Functional / Regression | Page: Admin: Manage services; Services | Requirement: REQ-SVC-01, REQ-SVC-03
    Given I am signed in as the "Editor"
    When I click the "Edit Software Testing" button
    And I change the "Title" field to "Software Testing Services"
    And I click the "Save service" button
    Then the status message should be "Service updated."
    When I open the path "services.html#testing"
    Then the "Software Testing Services" service card should be in view

  @TC-SVC-007 @regression @admin @REQ-SVC-01 @priority-medium
  Scenario: TC-SVC-007: Cancelling an edit discards the changes
    # Priority: Medium | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    When I click the "Edit Test Management" button
    And I change the "Title" field to "Changed title"
    And I click the "Cancel" button
    Then the service form should be closed
    And the services table should include "Test Management"
    And the services table should not include "Changed title"

  @TC-SVC-008 @regression @admin @REQ-SVC-01 @REQ-SVC-03 @priority-high
  Scenario: TC-SVC-008: Deleting a service asks for confirmation and removes it from the public page
    # Priority: High | Type: End-to-end | Page: Admin: Manage services; Services | Requirement: REQ-SVC-01, REQ-SVC-03
    Given I am signed in as the "Editor"
    When I click the "Delete UAT Management" button
    Then the confirmation should say "Delete UAT Management? This cannot be undone."
    When I click the "Confirm" button
    Then the status message should be "Service deleted."
    And the services table should list 5 services
    And the services table should not include "UAT Management"
    When I open the "Services" page
    Then I should see 5 service cards
    And there should be no "UAT Management" service card

  @TC-SVC-009 @regression @admin @REQ-SVC-01 @priority-medium
  Scenario: TC-SVC-009: Cancelling a delete keeps the service
    # Priority: Medium | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    When I click the "Delete QA Consultancy" button
    And I click the "Cancel" button
    Then the services table should list 6 services
    And the services table should include "QA Consultancy"

  @TC-SVC-010 @regression @admin @negative @REQ-SVC-01 @priority-medium
  Scenario Outline: TC-SVC-010: Services featured on the home page cannot be deleted
    # Priority: Medium | Type: Business rule | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    Then the "Delete <title>" button should be disabled

    Examples:
      | title |
      | Software Testing |
      | Test Management |
      | Test Leadership |
      | Test Automation |

  @TC-SVC-011 @regression @admin @negative @REQ-SVC-02 @priority-high
  Scenario Outline: TC-SVC-011: Duplicate and too-short titles are rejected
    # Priority: High | Type: Negative / Validation | Page: Admin: Manage services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I add a service with the title "<title>"
    Then the service form should show the error "<message>" for the "Title" field

    Examples:
      | title | message |
      | ab | Title must be between 3 and 60 characters. |
      | software testing | A service with this title already exists. |
      | SOFTWARE TESTING | A service with this title already exists. |

  @TC-SVC-012 @regression @admin @negative @boundary @REQ-SVC-02 @priority-high
  Scenario Outline: TC-SVC-012: Values just outside the limits are rejected
    # Priority: High | Type: Boundary / Validation | Page: Admin: Manage services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I add a service with a <field> of <length> characters
    Then the service form should show the error "<message>" for the "<error field>" field

    Examples:
      | field | length | error field | message |
      | title | 0 | Title | Enter a service title. |
      | title | 2 | Title | Title must be between 3 and 60 characters. |
      | title | 61 | Title | Title must be between 3 and 60 characters. |
      | summary | 0 | Summary | Enter a short summary. |
      | summary | 151 | Summary | Summary must be 150 characters or fewer. |
      | item | 101 | Items | Each item must be 100 characters or fewer. |

  @TC-SVC-013 @regression @admin @boundary @REQ-SVC-02 @priority-high
  Scenario Outline: TC-SVC-013: Values exactly at the limits are accepted
    # Priority: High | Type: Boundary / Validation | Page: Admin: Manage services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I add a service with a <field> of <length> characters
    Then the service should be saved

    Examples:
      | field | length |
      | title | 3 |
      | title | 60 |
      | summary | 1 |
      | summary | 150 |
      | item | 100 |

  @TC-SVC-014 @regression @admin @negative @boundary @REQ-SVC-02 @priority-medium
  Scenario Outline: TC-SVC-014: Too few or too many items are rejected
    # Priority: Medium | Type: Boundary / Validation | Page: Admin: Manage services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I add a service with <count> items
    Then the service form should show the error "<message>" for the "Items" field

    Examples:
      | count | message |
      | 0 | Add at least one item. |
      | 11 | No more than 10 items. |

  @TC-SVC-015 @regression @admin @boundary @REQ-SVC-02 @priority-medium
  Scenario Outline: TC-SVC-015: One item and ten items are accepted
    # Priority: Medium | Type: Boundary / Validation | Page: Admin: Manage services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I add a service with <count> items
    Then the service should be saved

    Examples:
      | count |
      | 1 |
      | 10 |

  @TC-SVC-016 @regression @admin @negative @a11y @REQ-SVC-02 @REQ-A11Y-02 @priority-high
  Scenario: TC-SVC-016: All errors are shown together, linked to their fields, with focus on the first
    # Priority: High | Type: Negative / Accessibility | Page: Admin: Manage services | Requirement: REQ-SVC-02, REQ-A11Y-02
    Given I am signed in as the "Editor"
    When I click the "Add service" button
    And I click the "Save service" button
    Then the service form should show the error "Enter a service title." for the "Title" field
    And the service form should show the error "Enter a short summary." for the "Summary" field
    And the service form should show the error "Add at least one item." for the "Items" field
    And the "Title" field should have keyboard focus
    And the service form should be open

  @TC-SVC-017 @regression @admin @REQ-SVC-01 @priority-medium
  Scenario: TC-SVC-017: The add form is empty each time it is opened
    # Priority: Medium | Type: Functional / State | Page: Admin: Manage services | Requirement: REQ-SVC-01
    Given I am signed in as the "Editor"
    When I click the "Edit Software Testing" button
    And I click the "Cancel" button
    And I click the "Add service" button
    Then the "Title" field should be empty
    And the "Summary" field should be empty
    And the "Items" field should be empty

  @TC-SVC-018 @regression @admin @REQ-SVC-02 @REQ-SVC-03 @priority-medium
  Scenario Outline: TC-SVC-018: Special characters and unicode are saved and displayed correctly
    # Priority: Medium | Type: Data / Unicode | Page: Admin: Manage services; Services | Requirement: REQ-SVC-02, REQ-SVC-03
    Given I am signed in as the "Editor"
    When I add a service with the title "<title>"
    Then the service should be saved
    And the services table should include "<title>"
    When I open the "Services" page
    Then I should see 7 service cards
    And the "<title>" service card should have the summary "A short summary for testing."

    Examples:
      | title |
      | O'Brien & Sons: QA/UAT |
      | R&D Testing (Phase 2) |
      | Café QA — 测试 |

  @TC-SVC-019 @regression @admin @security @REQ-SVC-04 @priority-high
  Scenario Outline: TC-SVC-019: Script text in a service is shown as text and never run
    # Priority: High | Type: Security (XSS) | Page: Admin: Manage services; Services | Requirement: REQ-SVC-04
    Given I am signed in as the "Editor"
    When I add a service with the title "<title>"
    Then the service should be saved
    And the services table should include "<title>"
    When I open the "Services" page
    Then the "<title>" service card should have the summary "A short summary for testing."
    And there should be no JavaScript errors on the page

    Examples:
      | title |
      | <script>alert(1)</script> |
      | <img src=x onerror=alert(1)> |

  @TC-SVC-020 @regression @admin @REQ-SVC-02 @priority-low
  Scenario: TC-SVC-020: Blank lines and extra spaces in the items are ignored
    # Priority: Low | Type: Data handling | Page: Admin: Manage services; Services | Requirement: REQ-SVC-02
    Given I am signed in as the "Editor"
    When I click the "Add service" button
    And I fill in the service form:
      | Title | Whitespace Check |
      | Summary | Checking how blank lines are handled. |
      | Items | First\n\n     Second\n\n |
    And I click the "Save service" button
    Then the service should be saved
    When I open the "Services" page
    Then the "Whitespace Check" service card should list the items:
      | First |
      | Second |

  @TC-SVC-021 @regression @admin @REQ-SVC-05 @priority-high
  Scenario: TC-SVC-021: Resetting restores the original six services everywhere
    # Priority: High | Type: End-to-end | Page: Admin: Manage services; Services | Requirement: REQ-SVC-05
    Given I am signed in as the "Editor"
    When I click the "Delete UAT Management" button
    And I click the "Confirm" button
    And I add a service with the title "Extra service"
    And I click the "Reset to original services" button
    Then the confirmation should say "Reset all services to the original list?"
    When I click the "Confirm" button
    Then the status message should be "Services reset to the original six."
    And the services table should list 6 services
    When I open the "Services" page
    Then I should see 6 service cards
    And the "UAT Management" service card should list 6 items

  @TC-SVC-022 @regression @admin @REQ-SVC-05 @priority-low
  Scenario: TC-SVC-022: Cancelling a reset keeps the changes
    # Priority: Low | Type: Functional | Page: Admin: Manage services | Requirement: REQ-SVC-05
    Given I am signed in as the "Editor"
    When I add a service with the title "Keep Me"
    And I click the "Reset to original services" button
    And I click the "Cancel" button
    Then the services table should list 7 services
    And the services table should include "Keep Me"
