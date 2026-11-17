# Generated from autolytics-website-test-cases.csv by scripts/generate-features.ts. Do not edit; edit the CSV instead.
@admin-access
Feature: Admin access control

  @TC-ACC-001 @regression @admin @negative @REQ-AUTH-04 @priority-high
  Scenario: TC-ACC-001: Signed-out visitors are sent to the sign-in page
    # Priority: High | Type: Security | Page: Admin | Requirement: REQ-AUTH-04
    Given I open the admin page "Manage services"
    Then I should be on the "Sign in" admin page
    And I should see the sign-in notice "Please sign in to continue."
    And the services table should not be visible

  @TC-ACC-002 @regression @admin @REQ-AUTH-04 @priority-low
  Scenario: TC-ACC-002: Signed-in staff skip the sign-in page
    # Priority: Low | Type: Functional | Page: Admin | Requirement: REQ-AUTH-04
    Given I am signed in as the "Editor"
    When I open the admin page "Sign in"
    Then I should be on the "Manage services" admin page

  @TC-ACC-003 @regression @admin @REQ-AUTH-05 @priority-high
  Scenario: TC-ACC-003: Viewers have read-only access
    # Priority: High | Type: Security / Permissions | Page: Admin | Requirement: REQ-AUTH-05
    Given I am signed in as the "Viewer"
    Then the read-only notice "You have read-only access. Ask an editor to make changes." should be shown
    And the "Add service" button should not be visible
    And the "Reset to original services" button should not be visible
    And the services table should have no Edit or Delete buttons
    And the services table should list 6 services

  @TC-ACC-004 @regression @admin @negative @REQ-AUTH-05 @priority-high
  Scenario: TC-ACC-004: A viewer cannot change services even by bypassing the screen
    # Priority: High | Type: Security / Permissions | Page: Admin | Requirement: REQ-AUTH-05
    Given I am signed in as the "Viewer"
    When I try to save a service directly through the browser
    Then the change should be refused with "Not permitted: read-only access"
    When I open the "Services" page
    Then I should see 6 service cards

  @TC-ACC-005 @regression @admin @negative @REQ-AUTH-05 @priority-high
  Scenario: TC-ACC-005: A signed-out visitor cannot change services either
    # Priority: High | Type: Security / Permissions | Page: Services | Requirement: REQ-AUTH-05
    Given I open the "Services" page
    When I try to save a service directly through the browser
    Then the change should be refused with "Not permitted: read-only access"
    And I should see 6 service cards
