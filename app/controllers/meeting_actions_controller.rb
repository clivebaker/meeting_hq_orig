class MeetingActionsController < ApplicationController
  before_action :set_meeting_action, only: %i[ show edit update destroy ]

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
  end

  # GET /meeting_actions/1/edit
  def edit
  end

  # POST /meeting_actions or /meeting_actions.json
  def create
    @meeting_action = MeetingAction.new(meeting_action_params)

    respond_to do |format|
      if @meeting_action.save
        format.html { redirect_to meeting_action_url(@meeting_action), notice: "Meeting action was successfully created." }
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
        format.html { redirect_to meeting_action_url(@meeting_action), notice: "Meeting action was successfully updated." }
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
      format.html { redirect_to meeting_actions_url, notice: "Meeting action was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_meeting_action
      @meeting_action = MeetingAction.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def meeting_action_params
      params.require(:meeting_action).permit(:meeting_id, :name, :note, :position, :state, :user_id)
    end
end
