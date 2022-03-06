require "application_system_test_case"

class HostedMeetingsTest < ApplicationSystemTestCase
  setup do
    @hosted_meeting = hosted_meetings(:one)
  end

  test "visiting the index" do
    visit hosted_meetings_url
    assert_selector "h1", text: "Hosted meetings"
  end

  test "should create hosted meeting" do
    visit hosted_meetings_url
    click_on "New hosted meeting"

    fill_in "Agenda", with: @hosted_meeting.agenda
    fill_in "Ended at", with: @hosted_meeting.ended_at
    fill_in "Meeting", with: @hosted_meeting.meeting_id
    fill_in "Slides", with: @hosted_meeting.slides
    fill_in "Started at", with: @hosted_meeting.started_at
    fill_in "Started by", with: @hosted_meeting.started_by
    click_on "Create Hosted meeting"

    assert_text "Hosted meeting was successfully created"
    click_on "Back"
  end

  test "should update Hosted meeting" do
    visit hosted_meeting_url(@hosted_meeting)
    click_on "Edit this hosted meeting", match: :first

    fill_in "Agenda", with: @hosted_meeting.agenda
    fill_in "Ended at", with: @hosted_meeting.ended_at
    fill_in "Meeting", with: @hosted_meeting.meeting_id
    fill_in "Slides", with: @hosted_meeting.slides
    fill_in "Started at", with: @hosted_meeting.started_at
    fill_in "Started by", with: @hosted_meeting.started_by
    click_on "Update Hosted meeting"

    assert_text "Hosted meeting was successfully updated"
    click_on "Back"
  end

  test "should destroy Hosted meeting" do
    visit hosted_meeting_url(@hosted_meeting)
    click_on "Destroy this hosted meeting", match: :first

    assert_text "Hosted meeting was successfully destroyed"
  end
end
