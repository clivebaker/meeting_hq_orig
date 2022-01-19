class MeetingActionsController < ApplicationController
  before_action :set_organisation
  before_action :set_meeting
  before_action :set_meeting_action, only: %i[ show edit update destroy ]
  before_action :set_users

  # GET /meeting_actions or /meeting_actions.json
  def index
    @meeting_actions = MeetingAction.all
  end

  # GET /meeting_actions/1 or /meeting_actions/1.json
  def show
  end

  # GET /meeting_actions/new
  def new
    @meeting_action = MeetingAction.new
    @meeting_action.meeting_id = @meeting.id
  end

  # GET /meeting_actions/1/edit
  def edit
  end

  # POST /meeting_actions or /meeting_actions.json
  def create
    @meeting_action = MeetingAction.new(meeting_action_params)

    respond_to do |format|
      if @meeting_action.save
        format.html { redirect_to organisation_meeting_meeting_action_url(@organisation, @meeting, @meeting_action), notice: "Meeting action was successfully created." }
        format.json { render :show, status: :created, location: @meeting_action }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @meeting_action.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /meeting_actions/1 or /meeting_actions/1.json
  def update
    respond_to do |format|
      if @meeting_action.update(meeting_action_params)
        format.html { redirect_to organisation_meeting_meeting_action_url(@organisation, @meeting, @meeting_action), notice: "Meeting action was successfully updated." }
        format.json { render :show, status: :ok, location: @meeting_action }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @meeting_action.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /meeting_actions/1 or /meeting_actions/1.json
  def destroy
    @meeting_action.destroy

    respond_to do |format|
      format.html { redirect_to organisation_meeting_meeting_actions_url(@organisation, @meeting), notice: "Meeting action was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private

    def set_users 

      @users = User.joins(:organisation_users).where('organisation_users.organisation_id = ?', @organisation.id)

    end

    def set_organisation
      @organisation = Organisation.find(params[:organisation_id])
    end
    def set_meeting
      @meeting = Meeting.find(params[:meeting_id])
    end
# Use callbacks to share common setup or constraints between actions.
    def set_meeting_action
      @meeting_action = MeetingAction.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def meeting_action_params
      params.require(:meeting_action).permit(:meeting_id, :name, :note, :user_id)
    end
end
