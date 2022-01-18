require "application_system_test_case"

class MeetingActionsTest < ApplicationSystemTestCase
  setup do
    @meeting_action = meeting_actions(:one)
  end

  test "visiting the index" do
    visit meeting_actions_url
    assert_selector "h1", text: "Meeting actions"
  end

  test "should create meeting action" do
    visit meeting_actions_url
    click_on "New meeting action"

    fill_in "Meeting", with: @meeting_action.meeting_id
    fill_in "Name", with: @meeting_action.name
    fill_in "Note", with: @meeting_action.note
    fill_in "Position", with: @meeting_action.position
    fill_in "State", with: @meeting_action.state
    fill_in "User", with: @meeting_action.user_id
    click_on "Create Meeting action"

    assert_text "Meeting action was successfully created"
    click_on "Back"
  end

  test "should update Meeting action" do
    visit meeting_action_url(@meeting_action)
    click_on "Edit this meeting action", match: :first

    fill_in "Meeting", with: @meeting_action.meeting_id
    fill_in "Name", with: @meeting_action.name
    fill_in "Note", with: @meeting_action.note
    fill_in "Position", with: @meeting_action.position
    fill_in "State", with: @meeting_action.state
    fill_in "User", with: @meeting_action.user_id
    click_on "Update Meeting action"

    assert_text "Meeting action was successfully updated"
    click_on "Back"
  end

  test "should destroy Meeting action" do
    visit meeting_action_url(@meeting_action)
    click_on "Destroy this meeting action", match: :first

    assert_text "Meeting action was successfully destroyed"
  end
end
