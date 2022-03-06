require "test_helper"

class HostedMeetingsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @hosted_meeting = hosted_meetings(:one)
  end

  test "should get index" do
    get hosted_meetings_url
    assert_response :success
  end

  test "should get new" do
    get new_hosted_meeting_url
    assert_response :success
  end

  test "should create hosted_meeting" do
    assert_difference("HostedMeeting.count") do
      post hosted_meetings_url, params: { hosted_meeting: { agenda: @hosted_meeting.agenda, ended_at: @hosted_meeting.ended_at, meeting_id: @hosted_meeting.meeting_id, slides: @hosted_meeting.slides, started_at: @hosted_meeting.started_at, started_by: @hosted_meeting.started_by } }
    end

    assert_redirected_to hosted_meeting_url(HostedMeeting.last)
  end

  test "should show hosted_meeting" do
    get hosted_meeting_url(@hosted_meeting)
    assert_response :success
  end

  test "should get edit" do
    get edit_hosted_meeting_url(@hosted_meeting)
    assert_response :success
  end

  test "should update hosted_meeting" do
    patch hosted_meeting_url(@hosted_meeting), params: { hosted_meeting: { agenda: @hosted_meeting.agenda, ended_at: @hosted_meeting.ended_at, meeting_id: @hosted_meeting.meeting_id, slides: @hosted_meeting.slides, started_at: @hosted_meeting.started_at, started_by: @hosted_meeting.started_by } }
    assert_redirected_to hosted_meeting_url(@hosted_meeting)
  end

  test "should destroy hosted_meeting" do
    assert_difference("HostedMeeting.count", -1) do
      delete hosted_meeting_url(@hosted_meeting)
    end

    assert_redirected_to hosted_meetings_url
  end
end
